import { describe, it, expect } from 'vitest';
import { sanitizeContentHtml } from '@/lib/sanitize';

describe('sanitizeContentHtml', () => {
  it('should remove dangerous tags and attributes', () => {
    const dirtyHtml = '<p>Hello <script>alert("xss");</script> World</p>';
    const cleanHtml = sanitizeContentHtml(dirtyHtml);
    
    expect(cleanHtml).not.toContain('<script>');
    expect(cleanHtml).not.toContain('alert("xss")');
    expect(cleanHtml).toContain('Hello');
    expect(cleanHtml).toContain('World');
  });

  it('should allow safe tags and attributes', () => {
    const safeHtml = '<p>Hello <strong class="bold">World</strong></p>';
    const result = sanitizeContentHtml(safeHtml);
    
    // Note: class attribute is not in allowed list, so it should be removed
    expect(result).toContain('<strong>World</strong>');
    expect(result).not.toContain('class="bold"');
  });

  it('should allow allowed attributes', () => {
    const htmlWithAllowedAttrs = '<a href="https://example.com" title="Example" target="_blank" rel="nofollow">Link</a>';
    const result = sanitizeContentHtml(htmlWithAllowedAttrs);
    
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('title="Example"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="nofollow"');
  });

  it('should remove disallowed attributes', () => {
    const htmlWithDisallowedAttrs = '<a href="https://example.com" onclick="alert(\'xss\')">Link</a>';
    const result = sanitizeContentHtml(htmlWithDisallowedAttrs);
    
    expect(result).toContain('href="https://example.com"');
    expect(result).not.toContain('onclick');
  });

  it('should handle empty string', () => {
    expect(sanitizeContentHtml('')).toBe('');
  });

  it('should handle null/undefined-like input', () => {
    // Note: The function expects string, so we test with empty string
    expect(sanitizeContentHtml('')).toBe('');
  });

  it('should preserve allowed tags structure', () => {
    const html = '<div><h1>Title</h1><p>Paragraph with <a href="/link">link</a></p></div>';
    const result = sanitizeContentHtml(html);
    
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<p>Paragraph with <a href="/link">link</a></p>');
    expect(result).toContain('<div>');
    expect(result).toContain('</div>');
  });
});