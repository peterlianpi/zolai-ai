import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma BEFORE importing
vi.mock('@/lib/prisma', () => ({
  default: {
    webhookEndpoint: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import {
  sendWebhookNotification,
  sendWebhookToAllEndpoints,
  registerWebhookEndpoint,
  deleteWebhookEndpoint,
  updateWebhookEndpoint,
  type WebhookPayload,
} from '@/lib/notifications/webhook-delivery';
import prisma from '@/lib/prisma';

// Mock fetch
global.fetch = vi.fn();

describe('Webhook Delivery Service', () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = global.fetch as any;
  });

  describe('sendWebhookNotification', () => {
    it('should send webhook without signature when no secret provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const payload: WebhookPayload = {
        event: 'notification.sent',
        timestamp: new Date().toISOString(),
        data: { userId: 'user-1' },
      };

      const result = await sendWebhookNotification(
        'https://example.com/webhook',
        payload
      );

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should sign webhook with HMAC when secret provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const payload: WebhookPayload = {
        event: 'notification.sent',
        timestamp: new Date().toISOString(),
        data: { userId: 'user-1' },
      };

      await sendWebhookNotification(
        'https://example.com/webhook',
        payload,
        'webhook-secret'
      );

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['X-Webhook-Signature']).toMatch(/^sha256=/);
    });

    it('should handle webhook errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Error'),
      });

      const payload: WebhookPayload = {
        event: 'notification.sent',
        timestamp: new Date().toISOString(),
        data: {},
      };

      const result = await sendWebhookNotification(
        'https://example.com/webhook',
        payload
      );

      expect(result.success).toBe(false);
    });
  });

  describe('sendWebhookToAllEndpoints', () => {
    it('should send to all active endpoints', async () => {
      const endpoints = [
        {
          id: 'webhook-1',
          url: 'https://endpoint1.com/webhook',
          events: ['notification.sent'],
          isActive: true,
        },
      ];

      vi.mocked(prisma.webhookEndpoint.findMany).mockResolvedValue(endpoints as any);
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      const result = await sendWebhookToAllEndpoints(
        'notification.sent',
        {}
      );

      expect(result.delivered).toBe(1);
    });

    it('should return success when no endpoints found', async () => {
      vi.mocked(prisma.webhookEndpoint.findMany).mockResolvedValue([]);

      const result = await sendWebhookToAllEndpoints(
        'notification.sent',
        {}
      );

      expect(result.success).toBe(true);
      expect(result.delivered).toBe(0);
    });
  });

  describe('registerWebhookEndpoint', () => {
    it('should register valid webhook endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      vi.mocked(prisma.webhookEndpoint.create).mockResolvedValue({
        id: 'webhook-1',
        url: 'https://example.com/webhook',
        events: ['notification.sent'],
      } as any);

      const result = await registerWebhookEndpoint(
        'user-1',
        'https://example.com/webhook',
        ['notification.sent']
      );

      expect(result.success).toBe(true);
      expect(result.endpoint?.url).toBe('https://example.com/webhook');
    });

    it('should reject invalid URLs', async () => {
      const result = await registerWebhookEndpoint(
        'user-1',
        'invalid-url',
        ['notification.sent']
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('deleteWebhookEndpoint', () => {
    it('should delete own endpoint', async () => {
      vi.mocked(prisma.webhookEndpoint.findUnique).mockResolvedValue({
        id: 'webhook-1',
        userId: 'user-1',
      } as any);
      vi.mocked(prisma.webhookEndpoint.delete).mockResolvedValue({} as any);

      const result = await deleteWebhookEndpoint('user-1', 'webhook-1');

      expect(result.success).toBe(true);
    });

    it('should prevent unauthorized deletion', async () => {
      vi.mocked(prisma.webhookEndpoint.findUnique).mockResolvedValue({
        id: 'webhook-1',
        userId: 'user-2',
      } as any);

      const result = await deleteWebhookEndpoint('user-1', 'webhook-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('updateWebhookEndpoint', () => {
    it('should update webhook endpoint', async () => {
      vi.mocked(prisma.webhookEndpoint.findUnique).mockResolvedValue({
        id: 'webhook-1',
        userId: 'user-1',
        url: 'https://example.com/webhook',
        secret: 'secret',
      } as any);
      vi.mocked(prisma.webhookEndpoint.update).mockResolvedValue({
        id: 'webhook-1',
        events: ['notification.sent', 'notification.read'],
      } as any);

      const result = await updateWebhookEndpoint(
        'user-1',
        'webhook-1',
        { events: ['notification.sent', 'notification.read'] }
      );

      expect(result.success).toBe(true);
    });

    it('should prevent unauthorized updates', async () => {
      vi.mocked(prisma.webhookEndpoint.findUnique).mockResolvedValue({
        id: 'webhook-1',
        userId: 'user-2',
      } as any);

      const result = await updateWebhookEndpoint(
        'user-1',
        'webhook-1',
        { events: ['notification.sent'] }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });
  });
});
