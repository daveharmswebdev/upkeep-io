import { describe, it, expect } from 'vitest';
import { extractErrorMessage, isAuthError, isValidationError } from '../errorHandlers';

describe('errorHandlers', () => {
  describe('extractErrorMessage', () => {
    it('should extract error from axios response.data.error', () => {
      const axiosError = {
        response: {
          data: {
            error: 'Invalid credentials',
          },
        },
      };

      const result = extractErrorMessage(axiosError, 'Login failed');
      expect(result).toBe('Invalid credentials');
    });

    it('should extract error.message if response.data.error is not available', () => {
      const genericError = {
        message: 'Network error occurred',
      };

      const result = extractErrorMessage(genericError, 'Request failed');
      expect(result).toBe('Network error occurred');
    });

    it('should use fallback if neither response.data.error nor message exists', () => {
      const unknownError = {};

      const result = extractErrorMessage(unknownError, 'Something went wrong');
      expect(result).toBe('Something went wrong');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error message');

      const result = extractErrorMessage(error, 'Fallback message');
      expect(result).toBe('Test error message');
    });

    it('should handle null response', () => {
      const errorWithNullResponse = {
        response: null,
      };

      const result = extractErrorMessage(errorWithNullResponse, 'Failed');
      expect(result).toBe('Failed');
    });

    it('should handle undefined response', () => {
      const errorWithUndefinedResponse = {
        response: undefined,
      };

      const result = extractErrorMessage(errorWithUndefinedResponse, 'Failed');
      expect(result).toBe('Failed');
    });

    it('should handle null/undefined data', () => {
      const errorWithNullData = {
        response: {
          data: null,
        },
      };

      const result = extractErrorMessage(errorWithNullData, 'Failed');
      expect(result).toBe('Failed');
    });

    it('should prioritize response.data.error over message', () => {
      const errorWithBoth = {
        message: 'Generic error',
        response: {
          data: {
            error: 'Specific API error',
          },
        },
      };

      const result = extractErrorMessage(errorWithBoth, 'Fallback');
      expect(result).toBe('Specific API error');
    });

    it('should handle string errors', () => {
      const stringError = 'Simple string error';
      const result = extractErrorMessage(stringError, 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should handle empty string in response.data.error', () => {
      const errorWithEmptyString = {
        response: {
          data: {
            error: '',
          },
        },
        message: 'Backup message',
      };

      const result = extractErrorMessage(errorWithEmptyString, 'Fallback');
      expect(result).toBe('Backup message');
    });
  });

  describe('isAuthError', () => {
    it('should return true for 401 Unauthorized', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 403 Forbidden', () => {
      const error = {
        response: {
          status: 403,
        },
      };

      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for 400 Bad Request', () => {
      const error = {
        response: {
          status: 400,
        },
      };

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for 404 Not Found', () => {
      const error = {
        response: {
          status: 404,
        },
      };

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for 500 Server Error', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false when response is undefined', () => {
      const error = {};
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false when status is undefined', () => {
      const error = {
        response: {},
      };
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for 400 Bad Request', () => {
      const error = {
        response: {
          status: 400,
        },
      };

      expect(isValidationError(error)).toBe(true);
    });

    it('should return true for 422 Unprocessable Entity', () => {
      const error = {
        response: {
          status: 422,
        },
      };

      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for 401 Unauthorized', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for 404 Not Found', () => {
      const error = {
        response: {
          status: 404,
        },
      };

      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for 500 Server Error', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      expect(isValidationError(error)).toBe(false);
    });

    it('should return false when response is undefined', () => {
      const error = {};
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false when status is undefined', () => {
      const error = {
        response: {},
      };
      expect(isValidationError(error)).toBe(false);
    });
  });
});
