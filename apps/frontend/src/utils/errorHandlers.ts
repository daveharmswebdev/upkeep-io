/**
 * Pure utility functions for error handling and extraction
 * Centralizes error message extraction from API responses
 */

/**
 * Extract error message from API error response
 * Handles axios errors, generic errors, and fallback messages
 * @param err - Error object from axios/API call
 * @param fallback - Fallback message if extraction fails
 * @returns User-friendly error message
 * @example
 * extractErrorMessage(axiosError, 'Login failed') // "Invalid credentials"
 * extractErrorMessage(new Error('Network error'), 'Try again') // "Network error"
 * extractErrorMessage({}, 'Failed') // "Failed"
 */
export const extractErrorMessage = (err: any, fallback: string): string => {
  return err?.response?.data?.error || err?.message || fallback;
};

/**
 * Check if error is authentication-related (401, 403)
 * @param err - Error object from axios/API call
 * @returns true if error is 401 or 403
 * @example
 * isAuthError(axiosError) // true if 401/403
 */
export const isAuthError = (err: any): boolean => {
  const status = err?.response?.status;
  return status === 401 || status === 403;
};

/**
 * Check if error is validation-related (400, 422)
 * @param err - Error object from axios/API call
 * @returns true if error is 400 or 422
 * @example
 * isValidationError(axiosError) // true if 400/422
 */
export const isValidationError = (err: any): boolean => {
  const status = err?.response?.status;
  return status === 400 || status === 422;
};
