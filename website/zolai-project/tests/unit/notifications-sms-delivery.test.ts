import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  sendSMSNotification,
  sendBulkSMSNotification,
  type SMSOptions,
} from '@/lib/notifications/sms-delivery';

// Mock fetch
global.fetch = vi.fn();

describe('SMS Delivery Service', () => {
  let mockFetch: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = global.fetch as any;
    // Save original env
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });

  describe('sendSMSNotification - Twilio', () => {
    beforeEach(() => {
      process.env.SMS_PROVIDER = 'twilio';
      process.env.TWILIO_ACCOUNT_SID = 'test-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
    });

    it('should send SMS via Twilio successfully', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: 'SM123456789' }),
      });

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test notification',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SM123456789');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('twilio.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic'),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });

    it('should handle Twilio credentials missing', async () => {
      // Setup
      process.env.TWILIO_ACCOUNT_SID = '';

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials');
    });

    it('should handle Twilio API errors', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({
          message: 'Invalid phone number',
        }),
      });

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: 'invalid',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number');
    });

    it('should handle network errors', async () => {
      // Setup
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
    });

    it('should include priority in request if provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: 'SM123' }),
      });

      // Execute
      await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Urgent notification',
        priority: 'high',
      });

      // Assert
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('sendSMSNotification - Vonage', () => {
    beforeEach(() => {
      process.env.SMS_PROVIDER = 'vonage';
      process.env.VONAGE_API_KEY = 'test-key';
      process.env.VONAGE_API_SECRET = 'test-secret';
      process.env.VONAGE_FROM_NUMBER = 'ZOLAI';
    });

    it('should send SMS via Vonage successfully', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          messages: [{ 'message-id': 'MSG123456789' }],
        }),
      });

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test notification',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('MSG123456789');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('nexmo.com'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle missing Vonage credentials', async () => {
      // Setup
      process.env.VONAGE_API_KEY = '';

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials');
    });

    it('should use default FROM_NUMBER if not configured', async () => {
      // Setup
      delete process.env.VONAGE_FROM_NUMBER;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          messages: [{ 'message-id': 'MSG123' }],
        }),
      });

      // Execute
      await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      expect(call[1].body).toContain('from=ZOLAI');
    });

    it('should handle Vonage API failures', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendSMSNotification - AWS SNS', () => {
    beforeEach(() => {
      process.env.SMS_PROVIDER = 'aws_sns';
    });

    it('should return not implemented for AWS SNS', async () => {
      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });
  });

  describe('sendSMSNotification - Invalid Provider', () => {
    it('should return error for unconfigured provider', async () => {
      // Setup
      process.env.SMS_PROVIDER = 'unknown-provider';

      // Execute
      const result = await sendSMSNotification({
        userId: 'user-1',
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });
  });

  describe('sendBulkSMSNotification', () => {
    beforeEach(() => {
      process.env.SMS_PROVIDER = 'twilio';
      process.env.TWILIO_ACCOUNT_SID = 'test-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
    });

    it('should send to multiple recipients in batches', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: 'SM123' }),
      });

      // Execute
      const result = await sendBulkSMSNotification({
        userIds: ['user-1', 'user-2', 'user-3'],
        phoneNumber: '+1987654321',
        message: 'Bulk notification',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
    });

    it('should call fetch for each user', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: 'SM123' }),
      });

      // Execute
      const userIds = Array.from({ length: 12 }, (_, i) => `user-${i}`);
      await sendBulkSMSNotification({
        userIds,
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert - Should be called 12 times (one per user)
      expect(mockFetch).toHaveBeenCalledTimes(12);
    });

    it('should track partial failures', async () => {
      // Setup
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ sid: 'SM1' }),
        })
        .mockRejectedValueOnce(new Error('Send failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ sid: 'SM3' }),
        });

      // Execute
      const result = await sendBulkSMSNotification({
        userIds: ['user-1', 'user-2', 'user-3'],
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.success).toBe(false);
    });

    it('should handle empty user list', async () => {
      // Execute
      const result = await sendBulkSMSNotification({
        userIds: [],
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should return success when all messages sent', async () => {
      // Setup
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: 'SM123' }),
      });

      // Execute
      const result = await sendBulkSMSNotification({
        userIds: ['user-1', 'user-2'],
        phoneNumber: '+1987654321',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
