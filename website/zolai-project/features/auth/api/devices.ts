import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import prisma from '@/lib/prisma';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import { ok, unauthorized, internalError } from '@/lib/api/response';
import {
  getActiveDevices,
  getLoginHistory,
  revokeSession,
} from '@/lib/auth/login-history';

const deviceRouter = new Hono()
  .get('/active', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user) return unauthorized(c, 'Authentication required');

    try {
      const devices = await getActiveDevices(session.user.id);
      return ok(c, { devices });
    } catch {
      return internalError(c, 'Failed to fetch active devices');
    }
  })

  .get('/history', 
    zValidator('query', z.object({
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })),
    async (c) => {
      const session = await getSessionFromContext(c);
      if (!session?.user) return unauthorized(c, 'Authentication required');

      try {
        const { limit } = c.req.valid('query');
        const history = await getLoginHistory(session.user.id, limit);
        return ok(c, { history });
      } catch {
        return internalError(c, 'Failed to fetch login history');
      }
    }
  )

  .post('/revoke/:id',
    zValidator('json', z.object({
      reason: z.string().optional(),
    })),
    async (c) => {
      const session = await getSessionFromContext(c);
      if (!session?.user) return unauthorized(c, 'Authentication required');

      try {
        const id = c.req.param('id');
        const { reason } = c.req.valid('json');

        // Verify ownership
        const device = await prisma.loginHistory.findUnique({ where: { id } });
        if (!device || device.userId !== session.user.id) {
          return unauthorized(c, 'Cannot revoke this device');
        }

        const revoked = await revokeSession(id, reason);
        return ok(c, { revoked });
      } catch {
        return internalError(c, 'Failed to revoke session');
      }
    }
  )

  .post('/revoke-all-others', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user) return unauthorized(c, 'Authentication required');

    try {
      const currentSessionId = session.id;
      
      // Revoke all other active sessions
      await prisma.loginHistory.updateMany({
        where: {
          userId: session.user.id,
          isCurrentSession: true,
          NOT: { id: currentSessionId },
        },
        data: {
          isCurrentSession: false,
          revokedAt: new Date(),
          revokedReason: 'User revoked all other sessions',
        },
      });

      return ok(c, { message: 'All other sessions revoked' });
    } catch {
      return internalError(c, 'Failed to revoke sessions');
    }
  });

export default deviceRouter;
