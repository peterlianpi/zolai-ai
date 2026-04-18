import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { setCookie } from 'hono/cookie';

const CSRF_TOKEN_COOKIE = '__csrf-token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

const app = new Hono()
  .get('/', async (c) => {
    try {
      const token = generateToken();

      setCookie(c, CSRF_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: CSRF_TOKEN_EXPIRY,
        path: '/',
      });

      c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
      return c.json({ token });
    } catch {
      return c.json({ error: 'Failed to generate CSRF token' }, 500);
    }
  });

export default app;
