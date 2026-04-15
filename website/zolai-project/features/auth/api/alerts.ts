import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import { ok, unauthorized, internalError } from '@/lib/api/response';
import {
  getUserSecurityAlerts,
  markAlertAsRead,
  resolveAlert,
} from '@/lib/auth/suspicious-login';

const alertsRouter = new Hono()
  .get('/', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user) return unauthorized(c, 'Authentication required');

    try {
      const alerts = await getUserSecurityAlerts(session.user.id, 50);
      const unread = alerts.filter(a => !a.isRead).length;
      return ok(c, { alerts, unread });
    } catch {
      return internalError(c, 'Failed to fetch alerts');
    }
  })

  .post('/:id/read', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user) return unauthorized(c, 'Authentication required');

    try {
      const alertId = c.req.param('id');
      const alert = await markAlertAsRead(alertId);
      return ok(c, { alert });
    } catch {
      return internalError(c, 'Failed to mark alert as read');
    }
  })

  .post('/:id/resolve',
    zValidator('json', z.object({
      action: z.enum(['confirm_login', 'deny_login']).optional(),
    })),
    async (c) => {
      const session = await getSessionFromContext(c);
      if (!session?.user) return unauthorized(c, 'Authentication required');

      try {
        const alertId = c.req.param('id');
        const { action } = c.req.valid('json');

        const alert = await resolveAlert(alertId);

        // If user denies login, could trigger additional security measures
        if (action === 'deny_login') {
          // TODO: Revoke all sessions, force re-auth
        }

        return ok(c, { alert });
      } catch {
        return internalError(c, 'Failed to resolve alert');
      }
    }
  );

export default alertsRouter;
