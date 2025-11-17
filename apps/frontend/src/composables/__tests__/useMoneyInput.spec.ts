import { describe, it, expect, vi } from 'vitest';
import { useMoneyInput } from '../useMoneyInput';

describe('useMoneyInput', () => {
  describe('parseMoneyValue', () => {
    it('should parse valid number strings', () => {
      const { parseMoneyValue } = useMoneyInput();

      expect(parseMoneyValue('123.45')).toBe(123.45);
      expect(parseMoneyValue('1000')).toBe(1000);
      expect(parseMoneyValue('0.99')).toBe(0.99);
    });

    it('should return undefined for empty strings', () => {
      const { parseMoneyValue } = useMoneyInput();

      expect(parseMoneyValue('')).toBeUndefined();
      expect(parseMoneyValue('   ')).toBeUndefined();
    });

    it('should return undefined for invalid inputs', () => {
      const { parseMoneyValue } = useMoneyInput();

      expect(parseMoneyValue('abc')).toBeUndefined();
      expect(parseMoneyValue('$100')).toBeUndefined();
      expect(parseMoneyValue('not a number')).toBeUndefined();
    });

    it('should handle zero', () => {
      const { parseMoneyValue } = useMoneyInput();

      expect(parseMoneyValue('0')).toBe(0);
      expect(parseMoneyValue('0.00')).toBe(0);
    });

    it('should handle negative numbers', () => {
      const { parseMoneyValue } = useMoneyInput();

      expect(parseMoneyValue('-50')).toBe(-50);
      expect(parseMoneyValue('-123.45')).toBe(-123.45);
    });
  });

  describe('createMoneyInputHandler', () => {
    it('should create a handler that parses and sets field value', () => {
      const { createMoneyInputHandler } = useMoneyInput();
      const setFieldValue = vi.fn();

      const handler = createMoneyInputHandler(setFieldValue, 'price');
      const event = {
        target: { value: '123.45' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('price', 123.45);
    });

    it('should set undefined for empty input', () => {
      const { createMoneyInputHandler } = useMoneyInput();
      const setFieldValue = vi.fn();

      const handler = createMoneyInputHandler(setFieldValue, 'price');
      const event = {
        target: { value: '' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('price', undefined);
    });

    it('should work with different field names', () => {
      const { createMoneyInputHandler } = useMoneyInput();
      const setFieldValue = vi.fn();

      const handler = createMoneyInputHandler(setFieldValue, 'monthlyRent');
      const event = {
        target: { value: '1500' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('monthlyRent', 1500);
    });

    it('should set undefined for invalid input', () => {
      const { createMoneyInputHandler } = useMoneyInput();
      const setFieldValue = vi.fn();

      const handler = createMoneyInputHandler(setFieldValue, 'price');
      const event = {
        target: { value: 'invalid' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('price', undefined);
    });
  });

  describe('validateMoneyValue', () => {
    it('should return true for undefined values', () => {
      const { validateMoneyValue } = useMoneyInput();

      expect(validateMoneyValue(undefined)).toBe(true);
    });

    it('should return true for positive values', () => {
      const { validateMoneyValue } = useMoneyInput();

      expect(validateMoneyValue(100)).toBe(true);
      expect(validateMoneyValue(0.01)).toBe(true);
      expect(validateMoneyValue(9999.99)).toBe(true);
    });

    it('should return error message for negative values', () => {
      const { validateMoneyValue } = useMoneyInput();

      expect(validateMoneyValue(-50)).toBe('Amount must be positive');
      expect(validateMoneyValue(-0.01)).toBe('Amount must be positive');
    });

    it('should return error message for zero', () => {
      const { validateMoneyValue } = useMoneyInput();

      expect(validateMoneyValue(0)).toBe('Amount must be greater than zero');
    });
  });
});
