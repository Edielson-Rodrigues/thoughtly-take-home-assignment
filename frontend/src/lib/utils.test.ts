import { describe, it, expect } from 'vitest';
import { generateIdempotencyKey, formatCurrency } from './utils';

describe('generateIdempotencyKey', () => {
  it('generates a string', () => {
    const key = generateIdempotencyKey();
    expect(typeof key).toBe('string');
  });

  it('generates unique keys on each call', () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();
    expect(key1).not.toBe(key2);
  });

  it('generates keys with expected format (timestamp-random)', () => {
    const key = generateIdempotencyKey();
    expect(key).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('generates non-empty keys', () => {
    const key = generateIdempotencyKey();
    expect(key.length).toBeGreaterThan(0);
  });
});

describe('formatCurrency', () => {
  it('formats positive numbers as USD', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats numbers with cents', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats decimal values correctly', () => {
    expect(formatCurrency(49.5)).toBe('$49.50');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});
