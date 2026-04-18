import { Hono } from 'hono';
import prisma from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';
import { getSessionUserId } from '@/lib/auth/server-guards';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function generateKey(): string {
  return randomBytes(32).toString('hex');
}

const app = new Hono()
  .get('/', async (c) => {
    try {
      const userId = await getSessionUserId(c);
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const keys = await prisma.apiKey.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          keyPreview: true,
          isActive: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return ok(c, keys);
    } catch {
      return c.json({ error: 'Failed to fetch keys' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const userId = await getSessionUserId(c);
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const body = await c.req.json() as { name?: string; expiresAt?: string };
      const { name, expiresAt } = body;

      if (!name || typeof name !== 'string' || name.length === 0 || name.length > 100) {
        return c.json({ error: 'Invalid name' }, 400);
      }

      const rawKey = generateKey();
      const hashedKey = hashKey(rawKey);
      const keyPreview = rawKey.slice(0, 8);

      const apiKey = await prisma.apiKey.create({
        data: {
          name,
          key: hashedKey,
          keyPreview,
          userId,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      return c.json({
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: rawKey,
          keyPreview: apiKey.keyPreview,
          createdAt: apiKey.createdAt,
        },
      }, 201);
    } catch {
      return c.json({ error: 'Failed to create key' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    try {
      const userId = await getSessionUserId(c);
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const id = c.req.param('id');

      const apiKey = await prisma.apiKey.findUnique({ where: { id } });
      if (!apiKey || apiKey.userId !== userId) {
        return c.json({ error: 'Not found' }, 404);
      }

      await prisma.apiKey.delete({ where: { id } });
      return ok(c, { success: true });
    } catch {
      return c.json({ error: 'Failed to delete key' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const userId = await getSessionUserId(c);
      if (!userId) return c.json({ error: 'Unauthorized' }, 401);

      const id = c.req.param('id');
      const body = await c.req.json() as { name?: string; isActive?: boolean };
      const { name, isActive } = body;

      const apiKey = await prisma.apiKey.findUnique({ where: { id } });
      if (!apiKey || apiKey.userId !== userId) {
        return c.json({ error: 'Not found' }, 404);
      }

      const updated = await prisma.apiKey.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return ok(c, updated);
    } catch {
      return c.json({ error: 'Failed to update key' }, 500);
    }
  });

export default app;
