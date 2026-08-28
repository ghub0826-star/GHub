import { describe, it, expect } from 'vitest';
import formatOrderDate from '../../utils/formatOrderDate';

describe('formatOrderDate', () => {
  it('should format valid date', () => {
    const result = formatOrderDate('2026-06-10T10:30:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('0');
  });

  it('should return "-" for null input', () => {
    expect(formatOrderDate(null)).toBe('-');
  });

  it('should return "-" for undefined input', () => {
    expect(formatOrderDate(undefined)).toBe('-');
  });

  it('should return "-" for empty string', () => {
    expect(formatOrderDate('')).toBe('-');
  });

  it('should return raw input for invalid date', () => {
    expect(formatOrderDate('not-a-date')).toBe('not-a-date');
  });

  it('should handle ISO date string', () => {
    const result = formatOrderDate('2026-08-03T14:30:00');
    expect(result).toContain('2026');
    expect(result).toContain('03');
  });

  it('should handle Date object', () => {
    const result = formatOrderDate(new Date('2026-08-03T14:30:00Z'));
    expect(result).toContain('2026');
  });
});
