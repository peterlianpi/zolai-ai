import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma and email service BEFORE importing the actual functions
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email/resend', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: 'email-1' }),
}));

import { sendNotificationEmail, sendBulkNotificationEmail } from '@/lib/notifications/email-delivery';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email/resend';

describe('Email Delivery Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotificationEmail', () => {
    it('should send email and create notification for existing user', async () => {
      // Setup
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Test Notification',
        description: 'This is a test notification',
        type: 'email',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      // Execute
      const result = await sendNotificationEmail({
        userId: 'user-1',
        subject: 'Test Notification',
        title: 'Test Title',
        message: 'Test Message',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      // Setup
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Execute
      const result = await sendNotificationEmail({
        userId: 'non-existent',
        subject: 'Test',
        title: 'Test',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    it('should include action URL when provided', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      // Execute
      const result = await sendNotificationEmail({
        userId: 'user-1',
        subject: 'Action Required',
        title: 'Action Title',
        message: 'Click the button below',
        actionUrl: 'https://example.com/action',
        actionText: 'Click Here',
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle email sending errors gracefully', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockNotification = {
        id: 'notif-1',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      vi.mocked(sendEmail).mockRejectedValueOnce(new Error('Email service down'));

      // Execute
      const result = await sendNotificationEmail({
        userId: 'user-1',
        subject: 'Test',
        title: 'Test',
        message: 'Test',
      });

      // Assert - should still succeed because notification was created
      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // Setup
      vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
        new Error('DB Connection failed')
      );

      // Execute
      const result = await sendNotificationEmail({
        userId: 'user-1',
        subject: 'Test',
        title: 'Test',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendBulkNotificationEmail', () => {
    it('should send emails to multiple users', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      // Execute
      const result = await sendBulkNotificationEmail(
        ['user-1', 'user-2'],
        {
          subject: 'Bulk Notification',
          title: 'Bulk Title',
          message: 'Bulk Message',
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBeGreaterThan(0);
    });

    it('should handle partial failures in bulk sending', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockRejectedValueOnce(
        new Error('DB error')
      );

      // Execute
      const result = await sendBulkNotificationEmail(
        ['user-1'],
        {
          subject: 'Test',
          title: 'Test',
          message: 'Test',
        }
      );

      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('sent');
      expect(result).toHaveProperty('failed');
    });

    it('should respect batch size limits', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockNotification = {
        id: 'notif-1',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);

      // Execute
      const result = await sendBulkNotificationEmail(userIds, {
        subject: 'Bulk Test',
        title: 'Title',
        message: 'Message',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(100);
    });

    it('should return empty result for empty user list', async () => {
      // Execute
      const result = await sendBulkNotificationEmail(
        [],
        {
          subject: 'Test',
          title: 'Test',
          message: 'Test',
        }
      );

      // Assert
      expect(result.sent).toBe(0);
    });
  });
});
