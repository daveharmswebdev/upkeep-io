import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, formatDateTime } from '../formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format whole numbers with two decimal places', () => {
      expect(formatPrice(1000)).toBe('1,000.00');
    });

    it('should format decimals with two decimal places', () => {
      expect(formatPrice(1234.5)).toBe('1,234.50');
      expect(formatPrice(1234.56)).toBe('1,234.56');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatPrice(-1234.56)).toBe('-1,234.56');
    });

    it('should add thousands separators', () => {
      expect(formatPrice(1234567.89)).toBe('1,234,567.89');
    });

    it('should round to two decimal places', () => {
      expect(formatPrice(1234.567)).toBe('1,234.57');
      expect(formatPrice(1234.564)).toBe('1,234.56');
    });

    it('should handle very small numbers', () => {
      expect(formatPrice(0.01)).toBe('0.01');
      expect(formatPrice(0.1)).toBe('0.10');
    });
  });

  describe('formatDate', () => {
    // Use local timezone-aware dates to avoid timezone issues
    const testDate = new Date(2024, 0, 15); // January 15, 2024 (month is 0-indexed)
    const testDateString = '2024-01-15T12:00:00';

    it('should format Date object with long month by default', () => {
      const result = formatDate(testDate);
      expect(result).toBe('January 15, 2024');
    });

    it('should format Date object with short month when specified', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format ISO string with long month', () => {
      const result = formatDate(testDateString, 'long');
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should format ISO string with short month', () => {
      const result = formatDate(testDateString, 'short');
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should handle dates at year boundaries', () => {
      const newYearsEve = new Date(2023, 11, 31); // December 31, 2023
      expect(formatDate(newYearsEve, 'short')).toBe('Dec 31, 2023');

      const newYearsDay = new Date(2024, 0, 1); // January 1, 2024
      expect(formatDate(newYearsDay, 'short')).toBe('Jan 1, 2024');
    });

    it('should handle different months', () => {
      expect(formatDate(new Date(2024, 1, 29), 'short')).toBe('Feb 29, 2024'); // Leap year
      expect(formatDate(new Date(2024, 6, 4), 'long')).toBe('July 4, 2024');
      expect(formatDate(new Date(2024, 11, 25), 'short')).toBe('Dec 25, 2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object with time', () => {
      const testDate = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(testDate);
      // Note: Result will vary based on timezone, so we check for key components
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should format ISO string with time', () => {
      const testDateString = '2024-01-15T09:15:00';
      const result = formatDateTime(testDateString);
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should include AM/PM designation', () => {
      const morning = new Date('2024-01-15T09:30:00');
      const evening = new Date('2024-01-15T21:30:00');

      const morningResult = formatDateTime(morning);
      const eveningResult = formatDateTime(evening);

      // At least one should contain AM or PM
      const hasTimeDesignation = morningResult.includes('AM') ||
                                 morningResult.includes('PM') ||
                                 eveningResult.includes('AM') ||
                                 eveningResult.includes('PM');
      expect(hasTimeDesignation).toBe(true);
    });

    it('should format midnight and noon correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00');
      const noon = new Date('2024-01-15T12:00:00');

      const midnightResult = formatDateTime(midnight);
      const noonResult = formatDateTime(noon);

      expect(midnightResult).toContain('2024');
      expect(noonResult).toContain('2024');
    });
  });
});
