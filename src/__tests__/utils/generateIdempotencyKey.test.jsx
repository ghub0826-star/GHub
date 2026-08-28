import generateIdempotencyKey from '../../utils/generateIdempotencyKey';

describe('generateIdempotencyKey', () => {
  it('should generate a string', () => {
    expect(typeof generateIdempotencyKey()).toBe('string');
  });

  it('should generate unique keys', () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();
    expect(key1).not.toBe(key2);
  });

  it('should generate a UUID when crypto.randomUUID is available', () => {
    const key = generateIdempotencyKey();
    expect(key).toHaveLength(36);
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('should generate many unique keys', () => {
    const keys = new Set();
    for (let i = 0; i < 100; i++) {
      keys.add(generateIdempotencyKey());
    }
    expect(keys.size).toBe(100);
  });
});
