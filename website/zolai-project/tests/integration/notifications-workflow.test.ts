/**
 * Integration tests for end-to-end notification workflows
 * Tests complete notification lifecycle: creation → delivery → reading
 *
 * Note: These tests focus on workflow integration without deep mocking,
 * allowing the actual service implementations to be tested.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock only external dependencies (email, fetch)
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ success: true, id: 'email-1' }),
    },
  },
}));

// Mock fetch for webhook and external API calls
global.fetch = vi.fn();

import { sendWebhookNotification } from '@/lib/notifications/webhook-delivery';
import { sendPushNotification } from '@/lib/notifications/push-delivery';

describe('Notification Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Webhook Delivery Integration', () => {
    it('should send webhook with proper signature format', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        text: async () => '{}',
      } as any);

      const result = await sendWebhookNotification(
        'https://webhook.example.com/events',
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { notificationId: 'notif-1' },
        },
        'test-secret'
      );

      // Verify webhook was sent
      expect(result.success).toBe(true);

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const headers = (callArgs[1] as any).headers;

      // Verify HMAC signature is present and properly formatted
      expect(headers['X-Webhook-Signature']).toBeDefined();
      expect(headers['X-Webhook-Signature']).toMatch(/^sha256=/);
    });

    it('should send webhook without signature when no secret provided', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        text: async () => '{}',
      } as any);

      const result = await sendWebhookNotification(
        'https://webhook.example.com/events',
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { notificationId: 'notif-1' },
        }
      );

      expect(result.success).toBe(true);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const headers = (callArgs[1] as any).headers;

      // Should not have signature header
      expect(headers['X-Webhook-Signature']).toBeUndefined();
    });

    it('should handle webhook delivery errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network timeout'));

      const result = await sendWebhookNotification(
        'https://webhook.example.com/events',
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { notificationId: 'notif-1' },
        }
      );

      // Should return error
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle webhook 4xx and 5xx status codes', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
        text: async () => 'Server error',
      } as any);

      const result = await sendWebhookNotification(
        'https://webhook.example.com/events',
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { notificationId: 'notif-1' },
        }
      );

      // Should return failure with status code
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should include proper webhook headers', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '{}',
      } as any);

      const payload = {
        event: 'notification.sent',
        timestamp: '2024-01-01T00:00:00Z',
        data: { id: '123' },
      };

      await sendWebhookNotification(
        'https://webhook.example.com/events',
        payload
      );

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const headers = (callArgs[1] as any).headers;

      // Verify standard webhook headers
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Webhook-Event']).toBe('notification.sent');
      expect(headers['X-Webhook-Timestamp']).toBe('2024-01-01T00:00:00Z');
      expect(headers['User-Agent']).toContain('Zolai-Webhook-Service');
    });
  });

  describe('Push Notification Delivery Integration', () => {
    it('should send push notifications to multiple subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint1',
          auth: 'auth-key-1',
          p256dh: 'p256-key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sub-2',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint2',
          auth: 'auth-key-2',
          p256dh: 'p256-key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock successful push responses
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({}),
          text: async () => '{}',
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({}),
          text: async () => '{}',
        } as any);

      const result = await sendPushNotification(mockSubscriptions as any, {
        title: 'Test',
        body: 'Test body',
        tag: 'test',
      });

      expect(result.success).toBe(true);
      expect(result.sent).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle push subscription deletion (410 Gone)', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint1',
          auth: 'auth-key-1',
          p256dh: 'p256-key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock 410 response (subscription expired)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 410,
        json: async () => ({ error: 'Subscription expired' }),
        text: async () => 'Subscription expired',
      } as any);

      const result = await sendPushNotification(mockSubscriptions as any, {
        title: 'Test',
        body: 'Test body',
      });

      // Should handle gracefully with failures count
      expect(result).toBeDefined();
      expect(result.failed).toBeGreaterThan(0);
    });

    it('should handle mixed success and failure push deliveries', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint1',
          auth: 'auth-1',
          p256dh: 'p256-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sub-2',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint2',
          auth: 'auth-2',
          p256dh: 'p256-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // First succeeds, second fails
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({}),
          text: async () => '{}',
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 410,
          json: async () => ({}),
          text: async () => 'Gone',
        } as any);

      const result = await sendPushNotification(mockSubscriptions as any, {
        title: 'Test',
        body: 'Test',
      });

      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
    });

    it('should handle network errors in push delivery', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint1',
          auth: 'auth-1',
          p256dh: 'p256-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await sendPushNotification(mockSubscriptions as any, {
        title: 'Test',
        body: 'Test',
      });

      // Should handle error gracefully
      expect(result).toBeDefined();
      expect(result.failed).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Notification Operations', () => {
    it('should handle parallel webhook deliveries', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        text: async () => '{}',
      } as any);

      const payloads = [
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { id: '1' },
        },
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { id: '2' },
        },
        {
          event: 'notification.sent',
          timestamp: new Date().toISOString(),
          data: { id: '3' },
        },
      ];

      const results = await Promise.all(
        payloads.map((payload) =>
          sendWebhookNotification(
            'https://webhook.example.com/events',
            payload
          )
        )
      );

      // All should succeed
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
    });

    it('should handle parallel push deliveries', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({}),
        text: async () => '{}',
      } as any);

      const subscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          endpoint: 'https://push.example.com/endpoint1',
          auth: 'auth-1',
          p256dh: 'p256-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = await Promise.all([
        sendPushNotification(subscriptions as any, { title: 'Test 1', body: 'Body 1' }),
        sendPushNotification(subscriptions as any, { title: 'Test 2', body: 'Body 2' }),
        sendPushNotification(subscriptions as any, { title: 'Test 3', body: 'Body 3' }),
      ]);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe('Webhook Signature Security', () => {
    it('should correctly sign webhook payload with HMAC-SHA256', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '{}',
      } as any);

      const payload = {
        event: 'notification.sent',
        timestamp: '2024-01-01T00:00:00Z',
        data: { id: '123' },
      };

      await sendWebhookNotification(
        'https://webhook.example.com/events',
        payload,
        'my-secret-key'
      );

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const headers = (callArgs[1] as any).headers;
      const body = (callArgs[1] as any).body;

      // Verify signature exists and is in correct format
      const signature = headers['X-Webhook-Signature'];
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/i);

      // Verify body was serialized to JSON
      expect(typeof body).toBe('string');
      expect(JSON.parse(body)).toEqual(payload);
    });

    it('should produce consistent signatures for identical payloads', async () => {
      const signatures: string[] = [];

      for (let i = 0; i < 3; i++) {
        vi.mocked(global.fetch).mockClear();
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({}),
          text: async () => '{}',
        } as any);

        const payload = {
          event: 'notification.sent',
          timestamp: '2024-01-01T00:00:00Z',
          data: { id: '123' },
        };

        await sendWebhookNotification(
          'https://webhook.example.com/events',
          payload,
          'test-secret'
        );

        const callArgs = vi.mocked(global.fetch).mock.calls[0];
        const headers = (callArgs[1] as any).headers;
        signatures.push(headers['X-Webhook-Signature']);
      }

      // All signatures should be identical for same payload and secret
      expect(signatures[0]).toBe(signatures[1]);
      expect(signatures[1]).toBe(signatures[2]);
    });
  });

  describe('Error Resilience', () => {
    it('should handle webhook errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const payload = {
        event: 'notification.sent',
        timestamp: new Date().toISOString(),
        data: { id: '1' },
      };

      const result = await sendWebhookNotification('https://webhook.example.com/events', payload);

      // Should return error status rather than throwing
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
