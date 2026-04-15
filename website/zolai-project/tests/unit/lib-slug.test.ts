import { describe, it, expect } from 'vitest';
import { generateSlug } from '@/lib/slug';

describe('generateSlug', () => {
  it('should return empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
    expect(generateSlug('   ')).toBe('');
  });

  it('should convert simple text to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello@#$%World!')).toBe('helloworld');
    expect(generateSlug('Test & More')).toBe('test-more');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(generateSlug('Hello    World')).toBe('hello-world');
    expect(generateSlug('Hello---World')).toBe('hello-world');
    expect(generateSlug('Hello   -   World')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('-hello-world-')).toBe('hello-world');
    expect(generateSlug('--test--')).toBe('test');
  });

  it('should handle unicode characters', () => {
    expect(generateSlug('Café Münster')).toBe('caf-mnster');
  });

  it('should handle numbers and decimals in text', () => {
    expect(generateSlug('Version 2.0')).toBe('version-2-0');
    expect(generateSlug('Price $5.99')).toBe('price-5-99');
    expect(generateSlug('Item #1')).toBe('item-1');
  });

  it('should return empty string for only special characters', () => {
    expect(generateSlug('!!!@@@###')).toBe('');
  });

  it('should preserve alphanumeric characters', () => {
    expect(generateSlug('abc123XYZ')).toBe('abc123xyz');
  });
});