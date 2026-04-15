import { Page, expect, APIRequestContext } from '@playwright/test';

export class TestHelpers {
  constructor(
    private page: Page,
    private request: APIRequestContext
  ) {}

  // Authentication helpers
  async loginAsUser(email: string = 'test-user@example.com', password: string = 'TestPassword123!') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL('/dashboard');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  // API helpers
  async makeAuthenticatedRequest(endpoint: string, options: Record<string, unknown> = {}) {
    return await this.request.get(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      }
    });
  }

  async createTestPost(title: string = 'Test Post', content: string = 'Test content') {
    const response = await this.request.post('/api/content', {
      data: {
        title,
        content,
        type: 'POST',
        status: 'DRAFT'
      }
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async deleteTestPost(id: string) {
    const response = await this.request.delete(`/api/content/${id}`);
    expect(response.ok()).toBeTruthy();
  }

  // Security testing helpers
  async testCSRF(endpoint: string, method: string = 'POST', data: Record<string, unknown> = {}) {
    // Test without CSRF token
    const response = await this.request.fetch(endpoint, {
      method,
      data,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Should be rejected or handled appropriately
    return response;
  }

  async testRateLimit(endpoint: string, maxRequests: number = 100) {
    const responses = [];
    
    for (let i = 0; i < maxRequests + 5; i++) {
      const response = await this.request.get(endpoint);
      responses.push(response);
      
      if (response.status() === 429) {
        break;
      }
    }
    
    return responses;
  }

  // File upload helpers
  async uploadTestFile(filePath: string, fileType: string = 'image/jpeg') {
    const response = await this.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test-file.jpg',
          mimeType: fileType,
          buffer: Buffer.from('test file content')
        }
      }
    });
    
    return response;
  }

  // Validation helpers
  async expectToast(message: string) {
    await expect(this.page.locator('[data-sonner-toast]')).toContainText(message);
  }

  async expectErrorPage(statusCode: number = 404) {
    await expect(this.page.locator('h1')).toContainText(statusCode.toString());
  }

  // Performance helpers
  async measurePageLoad(url: string) {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Database helpers (for test cleanup)
  async cleanupTestData() {
    // Clean up test posts, users, etc.
    await this.request.delete('/api/test/cleanup');
  }
}

export function createTestHelpers(page: Page, request: APIRequestContext) {
  return new TestHelpers(page, request);
}
