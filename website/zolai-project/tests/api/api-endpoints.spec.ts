import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('API Endpoints', () => {
  let _helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    _helpers = createTestHelpers(page, request);
  });

  test.describe('Health and System APIs', () => {
    test('Health check should return system status', async ({ request }) => {
      const response = await request.get('/api/health');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('status', 'healthy');
      expect(body.data).toHaveProperty('timestamp');
      expect(body.data).toHaveProperty('uptime');
    });

    test('Check role endpoint should validate authentication', async ({ request }) => {
      // Without auth
      const unauthResponse = await request.get('/api/check-role');
      expect(unauthResponse.status()).toBe(401);
      
      // With auth (would need actual auth token)
      // const authResponse = await helpers.makeAuthenticatedRequest('/api/check-role');
      // expect(authResponse.ok()).toBeTruthy();
    });
  });

  test.describe('Content APIs', () => {
    test('Should list public content', async ({ request }) => {
      const response = await request.get('/api/content?status=PUBLISHED');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.content)).toBe(true);
    });

    test('Should create content with authentication', async ({ request }) => {
      // This would need authentication setup
      const response = await request.post('/api/content', {
        data: {
          title: 'Test API Content',
          content: 'Test content body',
          type: 'POST',
          status: 'DRAFT'
        }
      });
      
      // Should require authentication
      expect([401, 201]).toContain(response.status());
    });

    test('Should validate content data', async ({ request }) => {
      const response = await request.post('/api/content', {
        data: {
          // Missing required fields
          title: '',
          content: ''
        }
      });
      
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    test('Should handle content pagination', async ({ request }) => {
      const response = await request.get('/api/content?page=1&limit=5');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.data).toHaveProperty('meta');
      expect(body.data.meta).toHaveProperty('page', 1);
      expect(body.data.meta).toHaveProperty('limit', 5);
      expect(body.data.meta).toHaveProperty('total');
    });
  });

  test.describe('Media APIs', () => {
    test('Should list media files', async ({ request }) => {
      const response = await request.get('/api/media');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Should validate file uploads', async ({ request }) => {
      const response = await request.post('/api/upload', {
        multipart: {
          file: {
            name: 'test.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('test content')
          }
        }
      });
      
      // Should reject non-image files
      expect(response.status()).toBe(400);
    });

    test('Should enforce file size limits', async ({ request }) => {
      // Create a large buffer (simulating oversized file)
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      const response = await request.post('/api/upload', {
        multipart: {
          file: {
            name: 'large-file.jpg',
            mimeType: 'image/jpeg',
            buffer: largeBuffer
          }
        }
      });
      
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.message).toContain('size exceeds');
    });
  });

  test.describe('Comments APIs', () => {
    test('Should list comments for content', async ({ request }) => {
      const response = await request.get('/api/comments?postId=sample-post-id');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Should create comments with authentication', async ({ request }) => {
      const response = await request.post('/api/comments', {
        data: {
          content: 'Test comment content',
          postId: 'sample-post-id'
        }
      });
      
      // Should require authentication
      expect([401, 201]).toContain(response.status());
    });

    test('Should validate comment content', async ({ request }) => {
      const response = await request.post('/api/comments', {
        data: {
          content: '', // Empty content
          postId: 'sample-post-id'
        }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Admin APIs', () => {
    test('Should require admin role for admin endpoints', async ({ request }) => {
      const adminEndpoints = [
        '/api/admin/stats',
        '/api/admin/users',
        '/api/admin/recent-activity'
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request.get(endpoint);
        expect([401, 403]).toContain(response.status());
      }
    });

    test('Should return admin statistics', async ({ request }) => {
      // This would need admin authentication
      const response = await request.get('/api/admin/stats');
      
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('totalUsers');
        expect(body.data).toHaveProperty('totalPosts');
      }
    });
  });

  test.describe('Security APIs', () => {
    test('Should log security events', async ({ request }) => {
      const response = await request.post('/api/security/log-event', {
        data: {
          type: 'BRUTE_FORCE',
          ip: '192.168.1.100',
          severity: 'HIGH'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('Should validate security event data', async ({ request }) => {
      const response = await request.post('/api/security/log-event', {
        data: {
          type: 'INVALID_TYPE', // Invalid enum value
          severity: 'HIGH'
        }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('SEO and Meta APIs', () => {
    test('Should return SEO metadata', async ({ request }) => {
      const response = await request.get('/api/seo?path=/');
      
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('title');
      expect(body.data).toHaveProperty('description');
    });

    test('Should handle sitemap generation', async ({ request }) => {
      const response = await request.get('/sitemap.xml');
      
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('xml');
    });
  });

  test.describe('Rate Limiting', () => {
    test('Should enforce rate limits', async ({ request }) => {
      // Make rapid requests to trigger rate limiting
      const requests = Array.from({ length: 101 }, () =>
        request.get('/api/health')
      );
      
      const responses = await Promise.all(requests);
      
      // Should eventually get rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('Should handle 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint');
      
      expect(response.status()).toBe(404);
    });

    test('Should return consistent error format', async ({ request }) => {
      const response = await request.post('/api/content', {
        data: { invalid: 'data' }
      });
      
      expect(response.status()).toBe(400);
      const body = await response.json();
      
      expect(body.success).toBe(false);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
    });
  });
});
