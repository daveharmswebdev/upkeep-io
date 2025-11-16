/**
 * Pure utility functions for formatting values for display
 * No dependencies, easily testable, reusable across components
 */

/**
 * Format a number as USD currency
 * @param price - Number to format as currency
 * @returns Formatted string like "1,234.50"
 * @example
 * formatPrice(1234.5) // "1,234.50"
 * formatPrice(0) // "0.00"
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a date for display
 * @param date - Date object or ISO string
 * @param format - 'short' (Jan 15, 2024) or 'long' (January 15, 2024)
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2024-01-15'), 'short') // "Jan 15, 2024"
 * formatDate('2024-01-15', 'long') // "January 15, 2024"
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' = 'long'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  });
};

/**
 * Format a date with time for display
 * @param date - Date object or ISO string
 * @returns Formatted date and time string
 * @example
 * formatDateTime(new Date('2024-01-15T14:30:00')) // "Jan 15, 2024, 02:30 PM"
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
