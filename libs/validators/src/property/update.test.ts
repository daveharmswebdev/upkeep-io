import { updatePropertySchema } from './update';

describe('updatePropertySchema', () => {
  it('should allow all fields to be optional', () => {
    const result = updatePropertySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should allow partial updates - only street', () => {
    const result = updatePropertySchema.safeParse({
      street: '123 Main St'
    });
    expect(result.success).toBe(true);
  });

  it('should validate street when provided', () => {
    const result = updatePropertySchema.safeParse({
      street: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Street address is required');
    }
  });

  it('should validate state format when provided', () => {
    const result = updatePropertySchema.safeParse({
      state: 'California'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('2 characters');
    }
  });

  it('should validate zipCode format when provided', () => {
    const result = updatePropertySchema.safeParse({
      zipCode: '1234'
    });
    expect(result.success).toBe(false);
  });

  it('should allow valid zipCode formats', () => {
    const result1 = updatePropertySchema.safeParse({ zipCode: '12345' });
    expect(result1.success).toBe(true);

    const result2 = updatePropertySchema.safeParse({ zipCode: '12345-6789' });
    expect(result2.success).toBe(true);
  });

  it('should allow empty string for address2', () => {
    const result = updatePropertySchema.safeParse({
      address2: ''
    });
    expect(result.success).toBe(true);
  });

  it('should allow empty string for nickname', () => {
    const result = updatePropertySchema.safeParse({
      nickname: ''
    });
    expect(result.success).toBe(true);
  });

  it('should validate purchasePrice when provided', () => {
    const result = updatePropertySchema.safeParse({
      purchasePrice: -100
    });
    expect(result.success).toBe(false);
  });

  it('should handle purchaseDate as Date object', () => {
    const result = updatePropertySchema.safeParse({
      purchaseDate: new Date('2024-01-15')
    });
    expect(result.success).toBe(true);
  });

  it('should handle purchaseDate as empty string', () => {
    const result = updatePropertySchema.safeParse({
      purchaseDate: ''
    });
    expect(result.success).toBe(true);
  });

  it('should validate complete update payload', () => {
    const result = updatePropertySchema.safeParse({
      street: '123 Main St',
      address2: 'Apt 4B',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      nickname: 'Downtown Property',
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 250000
    });
    expect(result.success).toBe(true);
  });
});
