/**
 * Test utilities and mock helpers
 */

import { vi } from 'vitest';

/**
 * Mock Prisma user
 */
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock Prisma notification
 */
export const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  title: 'Test Notification',
  description: 'This is a test notification',
  type: 'email',
  read: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock Prisma webhook endpoint
 */
export const mockWebhookEndpoint = {
  id: 'webhook-1',
  userId: 'user-1',
  url: 'https://example.com/webhook',
  secret: 'test-secret-123',
  events: ['notification.sent', 'notification.read'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Create mock Prisma client
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    webhookEndpoint: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pushSubscription: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  };
}

/**
 * Mock email sending
 */
export const mockSendEmail = vi.fn().mockResolvedValue({ success: true, id: 'email-1' });

/**
 * Mock fetch for webhook and API calls
 */
export function mockFetch(response: any) {
  return vi.fn().mockResolvedValue({
    ok: response.ok !== false,
    status: response.status || 200,
    json: vi.fn().mockResolvedValue(response.json || {}),
    text: vi.fn().mockResolvedValue(response.text || ''),
  });
}

/**
 * Mock crypto for HMAC signing
 */
export const mockCrypto = {
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue({
      digest: vi.fn().mockReturnValue('mocked-signature-hash'),
    }),
  }),
};

/**
 * Helper to create webhook payload
 */
export function createMockWebhookPayload(event: string) {
  return {
    event,
    timestamp: new Date().toISOString(),
    data: { userId: 'user-1', notificationId: 'notif-1' },
    userId: 'user-1',
  };
}

/**
 * Helper to assert HMAC signature format
 */
export function isValidHmacSignature(signature: string): boolean {
  return signature.startsWith('sha256=') && signature.length > 10;
}
