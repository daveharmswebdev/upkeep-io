/**
 * Pure utility functions for date conversion and manipulation
 * Handles form date strings → Date objects conversion
 */

/**
 * Convert form date string to Date object
 * @param dateString - Date string from form input (YYYY-MM-DD or ISO format)
 * @returns Date object or undefined if empty/null
 * @example
 * convertFormDateToDate('2024-01-15') // Date object
 * convertFormDateToDate(undefined) // undefined
 * convertFormDateToDate('') // undefined
 */
export const convertFormDateToDate = (dateString?: string): Date | undefined => {
  return dateString ? new Date(dateString) : undefined;
};

/**
 * Convert multiple date fields in form data
 * @param data - Form data object
 * @param dateFields - Array of field names to convert to Date objects
 * @returns New object with converted dates (immutable)
 * @example
 * convertFormDates({ name: 'John', startDate: '2024-01-15' }, ['startDate'])
 * // { name: 'John', startDate: Date object }
 */
export const convertFormDates = <T extends Record<string, any>>(
  data: T,
  dateFields: string[]
): T => {
  const result: any = { ...data };

  dateFields.forEach((field) => {
    if (field in result && result[field]) {
      result[field] = new Date(result[field]);
    }
  });

  return result as T;
};

/**
 * Convert nested date fields in arrays of objects
 * Useful for form data with repeatable sections (lessees, occupants, etc.)
 * @param items - Array of objects with date fields
 * @param dateFields - Field names to convert in each object
 * @returns New array with converted dates (immutable)
 * @example
 * convertNestedDates(
 *   [{ name: 'John', signedDate: '2024-01-15' }],
 *   ['signedDate']
 * )
 * // [{ name: 'John', signedDate: Date object }]
 */
export const convertNestedDates = <T extends Record<string, any>>(
  items: T[],
  dateFields: string[]
): T[] => {
  return items.map((item) => convertFormDates(item, dateFields));
};

/**
 * Convert Date object to YYYY-MM-DD format for form date inputs
 * @param date - Date object to convert
 * @returns String in YYYY-MM-DD format or undefined if date is not provided
 * @example
 * formatDateForInput(new Date('2024-01-15')) // "2024-01-15"
 * formatDateForInput(undefined) // undefined
 */
export const formatDateForInput = (date?: Date | string): string | undefined => {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};
