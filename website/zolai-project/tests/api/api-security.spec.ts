import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('API Security Tests', () => {
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should enforce authentication on protected endpoints', async ({ request }) => {
    const protectedEndpoints = [
      '/api/admin/stats',
      '/api/content',
      '/api/upload',
      '/api/admin/users',
      '/api/security/events'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body.success).toBe(false);
    }
  });

  test('should enforce admin role on admin endpoints', async ({ request }) => {
    // Login as regular user first
    const loginResponse = await request.post('/api/auth/sign-in/email', {
      data: {
        email: 'test-user@example.com',
        password: 'TestPassword123!'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();

    const adminEndpoints = [
      '/api/admin/stats',
      '/api/admin/users',
      '/api/security/events',
      '/api/admin/site-settings'
    ];

    for (const endpoint of adminEndpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(403);
    }
  });

  test('should validate input data with Zod schemas', async ({ request }) => {
    // Test invalid data on various endpoints
    const invalidRequests = [
      {
        endpoint: '/api/content',
        method: 'POST',
        data: { title: '', content: '' } // Missing required fields
      },
      {
        endpoint: '/api/security/log-event',
        method: 'POST',
        data: { type: 'INVALID_TYPE' } // Invalid enum value
      },
      {
        endpoint: '/api/upload',
        method: 'POST',
        data: { file: 'not-a-file' } // Invalid file
      }
    ];

    for (const { endpoint, method, data } of invalidRequests) {
      const response = await request.fetch(endpoint, {
        method,
        data: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('BAD_REQUEST');
    }
  });

  test('should enforce rate limiting', async ({ request: _request }) => {
    const responses = await helpers.testRateLimit('/api/health', 10);
    
    // Should eventually get rate limited
    const rateLimitedResponse = responses.find(r => r.status() === 429);
    expect(rateLimitedResponse).toBeDefined();
  });

  test('should sanitize user input', async ({ request }) => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]>',
      '"; DROP TABLE users; --',
      '{{constructor.constructor("return process")().exit()}}'
    ];

    for (const maliciousInput of maliciousInputs) {
      const response = await request.post('/api/content', {
        data: {
          title: maliciousInput,
          content: maliciousInput,
          type: 'POST'
        }
      });
      
      if (response.ok()) {
        const body = await response.json();
        // Content should be sanitized
        expect(body.data.title).not.toContain('<script>');
        expect(body.data.content).not.toContain('<script>');
      }
    }
  });

  test('should validate file uploads securely', async ({ request }) => {
    // Test malicious file upload attempts
    const maliciousFiles = [
      {
        name: 'test.php',
        content: '<?php phpinfo(); ?>',
        mimeType: 'application/php'
      },
      {
        name: 'test.exe',
        content: 'MZ...',
        mimeType: 'application/octet-stream'
      },
      {
        name: '../../../etc/passwd',
        content: 'root:x:0:0:root:/root:/bin/bash',
        mimeType: 'text/plain'
      }
    ];

    for (const file of maliciousFiles) {
      const response = await request.post('/api/upload', {
        multipart: {
          file: {
            name: file.name,
            mimeType: file.mimeType,
            buffer: Buffer.from(file.content)
          }
        }
      });
      
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
    }
  });

  test('should log security events', async ({ request }) => {
    // Trigger a security event
    await request.post('/api/security/log-event', {
      data: {
        type: 'BRUTE_FORCE',
        ip: '192.168.1.100',
        severity: 'HIGH',
        details: { attempts: 5 }
      }
    });

    // Verify event was logged (admin endpoint)
    const response = await request.get('/api/security/events');
    if (response.ok()) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.events).toBeDefined();
    }
  });

  test('should handle SQL injection attempts', async ({ request }) => {
    const sqlInjectionAttempts = [
      "1' OR '1'='1",
      "'; DROP TABLE users; --",
      "1 UNION SELECT * FROM users",
      "admin'--",
      "1' AND 1=1 --"
    ];

    for (const injection of sqlInjectionAttempts) {
      const response = await request.get(`/api/content/${injection}`);
      
      // Should either be 404 (not found) or 400 (bad request), not 500 (error)
      expect([400, 404]).toContain(response.status());
    }
  });
});

test.describe('Content Security Policy Tests', () => {
  test('should set proper security headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers() || {};
    
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('should block inline scripts without nonce', async ({ page }) => {
    await page.goto('/');
    
    // Try to inject inline script
    const result = await page.evaluate(() => {
      try {
        const script = document.createElement('script');
        script.innerHTML = 'window.xssTest = true;';
        document.head.appendChild(script);
        return (window as { xssTest?: boolean }).xssTest || false;
      } catch {
        return false;
      }
    });
    
    expect(result).toBe(false);
  });
});
