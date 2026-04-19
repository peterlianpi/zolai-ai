import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sendDiscordNotification,
  sendSlackNotification,
  sendTelegramNotification,
  sendSlackBlockNotification,
  sendDiscordEmbedNotification,
  sendMultiPlatformNotification,
  type DiscordNotificationOptions,
  type SlackNotificationOptions,
  type TelegramNotificationOptions,
} from '@/lib/notifications/integrations';

// Mock fetch
global.fetch = vi.fn();

describe('Third-Party Integrations Service', () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = global.fetch as any;
  });

  describe('sendDiscordNotification', () => {
    it('should send Discord embed notification', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const options: DiscordNotificationOptions = {
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test Notification',
        description: 'This is a test Discord notification',
        color: 3898765,
      };

      // Execute
      const result = await sendDiscordNotification(options);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        options.webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(JSON.stringify(options.title)),
        })
      );
    });

    it('should include fields in Discord embed', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Execute
      await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
        fields: [
          { name: 'Field 1', value: 'Value 1' },
          { name: 'Field 2', value: 'Value 2', inline: true },
        ],
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.embeds[0].fields).toHaveLength(2);
    });

    it('should include thumbnail if provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Execute
      await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
        thumbnail: 'https://example.com/image.png',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.embeds[0].thumbnail).toEqual({ url: 'https://example.com/image.png' });
    });

    it('should use default color if not provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Execute
      await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.embeds[0].color).toBe(3898765);
    });

    it('should handle Discord API errors', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Execute
      const result = await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('401');
    });

    it('should handle network errors', async () => {
      // Setup
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      // Execute
      const result = await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
    });

    it('should include timestamp in embed', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Execute
      await sendDiscordNotification({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        title: 'Test',
        description: 'Description',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.embeds[0].timestamp).toBeDefined();
    });
  });

  describe('sendSlackNotification', () => {
    it('should send Slack text notification', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const options: SlackNotificationOptions = {
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        text: 'Test Slack notification',
      };

      // Execute
      const result = await sendSlackNotification(options);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        options.webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should include blocks if provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const blocks = [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Bold Text*' },
        },
      ];

      // Execute
      await sendSlackNotification({
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        text: 'Test',
        blocks,
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.blocks).toEqual(blocks);
    });

    it('should include attachments if provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const attachments = [
        {
          color: 'good',
          text: 'Attachment text',
        },
      ];

      // Execute
      await sendSlackNotification({
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        text: 'Test',
        attachments,
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.attachments).toEqual(attachments);
    });

    it('should handle Slack API errors', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      // Execute
      const result = await sendSlackNotification({
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        text: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('403');
    });
  });

  describe('sendSlackBlockNotification', () => {
    it('should send Slack notification with formatted blocks', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      // Execute
      const result = await sendSlackBlockNotification(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        'Test Title',
        [
          { title: 'Section 1', text: 'Content 1' },
          { title: 'Section 2', text: 'Content 2' },
        ]
      );

      // Assert
      expect(result.success).toBe(true);
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.blocks).toBeDefined();
      expect(body.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('sendTelegramNotification', () => {
    it('should send Telegram notification', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: { message_id: 123 },
        }),
      });

      const options: TelegramNotificationOptions = {
        botToken: 'test-bot-token',
        chatId: '123456789',
        message: 'Test Telegram notification',
      };

      // Execute
      const result = await sendTelegramNotification(options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('telegram.org'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include buttons if provided', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: { message_id: 123 },
        }),
      });

      // Execute
      await sendTelegramNotification({
        botToken: 'test-bot-token',
        chatId: '123456789',
        message: 'Test message',
        buttons: [
          { text: 'Button 1', url: 'https://example.com/1' },
          { text: 'Button 2', url: 'https://example.com/2' },
        ],
      });

      // Assert - body is URL-encoded, so check for encoded patterns
      const call = mockFetch.mock.calls[0];
      const body = call[1].body as string;
      expect(body).toContain('Button'); // Check for button text
      expect(body).toContain('example.com'); // Check for URL
    });

    it('should use HTML parse mode by default', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: { message_id: 123 },
        }),
      });

      // Execute
      await sendTelegramNotification({
        botToken: 'test-bot-token',
        chatId: '123456789',
        message: 'Test',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      expect(call[1].body).toContain('parse_mode=HTML');
    });

    it('should support different parse modes', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: { message_id: 123 },
        }),
      });

      // Execute
      await sendTelegramNotification({
        botToken: 'test-bot-token',
        chatId: '123456789',
        message: 'Test',
        parseMode: 'Markdown',
      });

      // Assert
      const call = mockFetch.mock.calls[0];
      expect(call[1].body).toContain('parse_mode=Markdown');
    });

    it('should handle Telegram API errors', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({
          description: 'Invalid chat_id',
        }),
      });

      // Execute
      const result = await sendTelegramNotification({
        botToken: 'test-bot-token',
        chatId: 'invalid',
        message: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid chat_id');
    });
  });

  describe('sendDiscordEmbedNotification', () => {
    it('should send Discord embed with multiple fields', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Execute
      const result = await sendDiscordEmbedNotification(
        'https://discord.com/api/webhooks/123/abc',
        'Title',
        'Description',
        [
          { name: 'Field 1', value: 'Value 1' },
          { name: 'Field 2', value: 'Value 2' },
        ],
        16711680 // Red color
      );

      // Assert
      expect(result.success).toBe(true);
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.embeds[0].fields).toHaveLength(2);
      expect(body.embeds[0].color).toBe(16711680);
    });
  });

  describe('sendMultiPlatformNotification', () => {
    it('should send to all provided platforms', async () => {
      // Setup
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 204 }) // Discord
        .mockResolvedValueOnce({ ok: true, status: 200 }) // Slack
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: { message_id: 123 } }),
        }); // Telegram

      // Execute
      const result = await sendMultiPlatformNotification(
        'Multi-Platform Test',
        'This message goes to all platforms',
        {
          discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
          slack: {
            webhookUrl:
              'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          },
          telegram: { botToken: 'test-token', chatId: '123456789' },
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.discord).toBe(true);
      expect(result.slack).toBe(true);
      expect(result.telegram).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      // Setup
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 204 }) // Discord
        .mockRejectedValueOnce(new Error('Network error')) // Slack
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: { message_id: 123 } }),
        }); // Telegram

      // Execute
      const result = await sendMultiPlatformNotification(
        'Test',
        'Message',
        {
          discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
          slack: {
            webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          },
          telegram: { botToken: 'test-token', chatId: '123456789' },
        }
      );

      // Assert
      expect(result.success).toBe(true); // At least one succeeded
      expect(result.discord).toBe(true);
      expect(result.slack).toBe(false);
      expect(result.telegram).toBe(true);
    });

    it('should support selective platform delivery', async () => {
      // Setup
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 }); // Discord only

      // Execute
      const result = await sendMultiPlatformNotification(
        'Discord Only',
        'Only Discord gets this',
        {
          discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
        }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.discord).toBe(true);
      expect(result.slack).toBe(false);
      expect(result.telegram).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return failure if all platforms fail', async () => {
      // Setup
      mockFetch
        .mockRejectedValueOnce(new Error('Discord error'))
        .mockRejectedValueOnce(new Error('Slack error'))
        .mockRejectedValueOnce(new Error('Telegram error'));

      // Execute
      const result = await sendMultiPlatformNotification(
        'Test',
        'Message',
        {
          discord: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
          slack: {
            webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          },
          telegram: { botToken: 'test-token', chatId: '123456789' },
        }
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.discord).toBe(false);
      expect(result.slack).toBe(false);
      expect(result.telegram).toBe(false);
    });
  });
});
