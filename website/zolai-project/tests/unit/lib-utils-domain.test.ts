import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { getAppUrl, getAuthBaseUrl, getApiUrl, isDevelopment, getAppName } from '@/lib/utils/domain';

describe('Domain Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getAppUrl', () => {
    it('should return NEXT_PUBLIC_APP_URL when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
      expect(getAppUrl()).toBe('https://example.com');
    });

    it('should fallback to NEXT_PUBLIC_API_URL when APP_URL not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      expect(getAppUrl()).toBe('https://api.example.com');
    });

    it('should fallback to NEXT_PUBLIC_BASE_URL when both APP_URL and API_URL not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_BASE_URL = 'https://base.example.com';
      expect(getAppUrl()).toBe('https://base.example.com');
    });

    it('should fallback to localhost:3000 when no environment variables set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;
      expect(getAppUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getAuthBaseUrl', () => {
    it('should return the same value as getAppUrl()', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://auth.example.com';
      expect(getAuthBaseUrl()).toBe(getAppUrl());
    });
  });

  describe('getApiUrl', () => {
    it('should return NEXT_PUBLIC_API_URL when set', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      expect(getApiUrl()).toBe('https://api.example.com');
    });

    it('should fallback to NEXT_PUBLIC_BASE_URL when API_URL not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_BASE_URL = 'https://base.example.com';
      expect(getApiUrl()).toBe('https://base.example.com');
    });

    it('should fallback to NEXT_PUBLIC_APP_URL when both API_URL and BASE_URL not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
      expect(getApiUrl()).toBe('https://app.example.com');
    });

    it('should fallback to localhost:3000 when no environment variables set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;
      expect(getApiUrl()).toBe('http://localhost:3000');
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('getAppName', () => {
    it('should return NEXT_PUBLIC_APP_NAME when set', () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'My Custom App';
      expect(getAppName()).toBe('My Custom App');
    });

    it('should return default P-Core System when not set', () => {
      delete process.env.NEXT_PUBLIC_APP_NAME;
      expect(getAppName()).toBe('P-Core System');
    });
  });
});