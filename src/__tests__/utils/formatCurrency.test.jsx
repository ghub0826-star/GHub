import formatCurrency from '../../utils/formatCurrency';

describe('formatCurrency', () => {
  it('should format number as IDR', () => {
    expect(formatCurrency(50000)).toBe('Rp 50.000');
  });

  it('should format large numbers with thousands separator', () => {
    expect(formatCurrency(1500000)).toBe('Rp 1.500.000');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-50000)).toBe('Rp -50.000');
  });

  it('should convert string to number', () => {
    expect(formatCurrency('100000')).toBe('Rp 100.000');
  });

  it('should return Rp 0 for NaN input', () => {
    expect(formatCurrency(NaN)).toBe('Rp 0');
  });

  it('should return Rp 0 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('Rp 0');
  });

  it('should return Rp 0 for null', () => {
    expect(formatCurrency(null)).toBe('Rp 0');
  });

  it('should return Rp 0 for empty string', () => {
    expect(formatCurrency('')).toBe('Rp 0');
  });

  it('should format decimal numbers by truncating', () => {
    expect(formatCurrency(50000.99)).toBe('Rp 50.001');
  });
});
