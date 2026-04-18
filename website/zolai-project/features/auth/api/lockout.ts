import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import prisma from '@/lib/prisma';
import { requirePermission, getSessionFromContext } from '@/lib/auth/server-guards';
import { PERMISSIONS } from '@/lib/auth/rbac';
import { ok, unauthorized, internalError } from '@/lib/api/response';
import { unlockAccount, getFailedAttempts } from '@/lib/auth/account-lockout';

const lockoutRouter = new Hono()
  .get('/status/:userId', async (c) => {
    const adminCheck = await requirePermission(c, PERMISSIONS.ADMIN_PANEL);
    if (adminCheck instanceof Response) return adminCheck;

    try {
      const userId = c.req.param('userId');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          accountLocked: true,
          lockoutExpires: true,
          failedLoginAttempts: true,
          lastFailedLoginAt: true,
        },
      });

      if (!user) return unauthorized(c, 'User not found');

      const failedAttempts = await getFailedAttempts(user.email || '', 15);

      return ok(c, {
        accountLocked: user.accountLocked,
        lockoutExpires: user.lockoutExpires,
        failedLoginAttempts: user.failedLoginAttempts,
        lastFailedLoginAt: user.lastFailedLoginAt,
        recentFailedAttempts: failedAttempts,
      });
    } catch {
      return internalError(c, 'Failed to fetch lockout status');
    }
  })

  .post('/unlock/:userId',
    zValidator('json', z.object({
      reason: z.string().optional(),
    })),
    async (c) => {
      const adminCheck = await requirePermission(c, PERMISSIONS.ADMIN_PANEL);
      if (adminCheck instanceof Response) return adminCheck;

      try {
        const userId = c.req.param('userId');
        const { reason } = c.req.valid('json');

        await unlockAccount(userId);

        // Log audit
        const session = await getSessionFromContext(c);
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'User',
            entityId: userId,
            createdById: session?.user?.id,
            newValues: { accountLocked: false },
            details: { reason },
          },
        });

        return ok(c, { message: 'Account unlocked' });
      } catch {
        return internalError(c, 'Failed to unlock account');
      }
    }
  )

  .get('/attempts/:email', async (c) => {
    const adminCheck = await requirePermission(c, PERMISSIONS.ADMIN_PANEL);
    if (adminCheck instanceof Response) return adminCheck;

    try {
      const email = c.req.param('email');
      const attempts = await prisma.loginAttempt.findMany({
        where: { email },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return ok(c, { attempts });
    } catch {
      return internalError(c, 'Failed to fetch login attempts');
    }
  });

export default lockoutRouter;
