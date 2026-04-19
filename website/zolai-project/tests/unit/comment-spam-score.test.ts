import { describe, it, expect } from 'vitest';
import { calculateSpamScore } from '@/features/comments/server/router';

describe('calculateSpamScore', () => {
  it('should return 0 for clean content', () => {
    const score = calculateSpamScore({
      authorName: 'John Doe',
      content: 'This is a great article!',
      authorUrl: '',
      authorIp: '192.168.1.1'
    });
    
    expect(score).toBe(0);
  });

  it('should detect spam keywords in content', () => {
    const score = calculateSpamScore({
      authorName: 'John Doe',
      content: 'Buy Viagra online now!!!',
      authorUrl: '',
      authorIp: '192.168.1.1'
    });
    
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should detect multiple spam indicators', () => {
    const score = calculateSpamScore({
      authorName: 'casino_player',
      content: 'Check out this amazing casino offer! Visit http://scam-site.com for free viagra!!!',
      authorUrl: 'http://casino-promo.com',
      authorIp: '0.0.0.1'
    });
    
    expect(score).toBeCloseTo(1, 1); // Should be close to maximum score
  });

  it('should cap score at 1.0', () => {
    const score = calculateSpamScore({
      authorName: 'buy viagra casino',
      content: 'http://link1.com http://link2.com http://link3.com http://link4.com Very long content with lots of spam indicators!!!',
      authorUrl: 'http://viagra-site.com',
      authorIp: '0.1.2.3'
    });
    
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should handle empty inputs gracefully', () => {
    const score = calculateSpamScore({
      authorName: '',
      content: '',
      authorUrl: '',
      authorIp: ''
    });
    
    expect(score).toBe(0);
  });
});