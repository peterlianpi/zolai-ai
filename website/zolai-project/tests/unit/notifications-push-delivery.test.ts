import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendPushNotification, type PushSubscriptionData } from '@/lib/notifications/push-delivery';

// Mock fetch
global.fetch = vi.fn();

describe('Push Delivery Service', () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = global.fetch as any;
  });

  describe('sendPushNotification', () => {
    it('should send to multiple subscriptions', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
      });

      const mockSubscriptions = [
        {
          endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
          auth: 'auth-token-1',
          p256dh: 'p256dh-1',
        } as any,
        {
          endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint2',
          auth: 'auth-token-2',
          p256dh: 'p256dh-2',
        } as any,
      ];

      // Execute
      const result = await sendPushNotification(
        mockSubscriptions,
        {
          title: 'Test Notification',
          body: 'This is a test push notification',
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should include icon and badge in payload', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
      } as any;

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'Test',
          body: 'Body',
          icon: '/custom-icon.png',
          badge: '/custom-badge.png',
          tag: 'custom-tag',
        }
      );

      // Assert
      const call = mockFetch.mock.calls[0];
      const payload = JSON.parse(call[1].body);
      expect(payload.notification.icon).toBe('/custom-icon.png');
      expect(payload.notification.badge).toBe('/custom-badge.png');
      expect(payload.notification.tag).toBe('custom-tag');
    });

    it('should use default icon and badge if not provided', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
      } as any;

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      const call = mockFetch.mock.calls[0];
      const payload = JSON.parse(call[1].body);
      expect(payload.notification.icon).toBe('/icon-192x192.png');
      expect(payload.notification.badge).toBe('/badge-72x72.png');
      expect(payload.notification.tag).toBe('default');
    });

    it('should include custom data in payload', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
      } as any;

      const customData = {
        url: 'https://example.com/notification',
        action: 'open-page',
      };

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'Test',
          body: 'Body',
          data: customData,
        }
      );

      // Assert
      const call = mockFetch.mock.calls[0];
      const payload = JSON.parse(call[1].body);
      expect(payload.notification.data).toEqual(customData);
    });

    it('should handle partial send failures', async () => {
      // Setup
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 201 })
        .mockResolvedValueOnce({ ok: false, status: 410 })
        .mockResolvedValueOnce({ ok: true, status: 201 });

      const mockSubscriptions = [
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1' } as any,
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint2' } as any,
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint3' } as any,
      ];

      // Execute
      const result = await sendPushNotification(
        mockSubscriptions,
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.success).toBe(false);
    });

    it('should handle network errors during send', async () => {
      // Setup
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 201 })
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({ ok: true, status: 201 });

      const mockSubscriptions = [
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1' } as any,
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint2' } as any,
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint3' } as any,
      ];

      // Execute
      const result = await sendPushNotification(
        mockSubscriptions,
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should return success when all notifications sent', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
      });

      const mockSubscriptions = [
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1' } as any,
        { endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint2' } as any,
      ];

      // Execute
      const result = await sendPushNotification(
        mockSubscriptions,
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle empty subscriptions list', async () => {
      // Execute
      const result = await sendPushNotification(
        [],
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should post to subscription endpoint', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      } as any;

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://fcm.googleapis.com/fcm/send/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should send JSON payload with notification structure', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      } as any;

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'My Title',
          body: 'My Body',
        }
      );

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body).toHaveProperty('notification');
      expect(body.notification.title).toBe('My Title');
      expect(body.notification.body).toBe('My Body');
    });

    it('should use Content-Type application/json header', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
      } as any;

      // Execute
      await sendPushNotification(
        [mockSubscription],
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert
      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Content-Type']).toBe('application/json');
    });

    it('should handle all subscriptions regardless of individual failures', async () => {
      // Setup - mix of success and failures
      mockFetch
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Error 5'));

      const mockSubscriptions = Array.from({ length: 5 }, (_, i) => ({
        endpoint: `https://fcm.googleapis.com/fcm/send/endpoint${i}`,
      } as any));

      // Execute
      const result = await sendPushNotification(
        mockSubscriptions,
        {
          title: 'Test',
          body: 'Body',
        }
      );

      // Assert - All 5 fetch calls should have been attempted
      expect(mockFetch).toHaveBeenCalledTimes(5);
      expect(result.sent + result.failed).toBe(5);
    });
  });
});
