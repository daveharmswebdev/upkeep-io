import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFormSubmission } from '../useFormSubmission';

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}));

vi.mock('vue-toastification', () => ({
  useToast: vi.fn()
}));

vi.mock('@/utils/errorHandlers', () => ({
  extractErrorMessage: vi.fn((err, fallback) => {
    if (err.response?.data?.error) {
      return err.response.data.error;
    }
    return fallback;
  })
}));

import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { extractErrorMessage } from '@/utils/errorHandlers';

describe('useFormSubmission', () => {
  let mockRouter: any;
  let mockToast: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn().mockResolvedValue(undefined)
    };

    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useToast).mockReturnValue(mockToast);
  });

  describe('submit', () => {
    it('should set isSubmitting to true during submission', async () => {
      const submitFn = vi.fn().mockImplementation(() => {
        return Promise.resolve();
      });

      const { isSubmitting, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      const submitPromise = submit({ test: 'data' });
      expect(isSubmitting.value).toBe(true);

      await submitPromise;
    });

    it('should set isSubmitting to false after successful submission', async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined);

      const { isSubmitting, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      await submit({ test: 'data' });

      expect(isSubmitting.value).toBe(false);
    });

    it('should set isSubmitting to false after failed submission', async () => {
      const submitFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { isSubmitting, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(isSubmitting.value).toBe(false);
    });

    it('should clear submitError on new submission', async () => {
      const submitFn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);

      const { submitError, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      // First submission - sets error
      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }
      expect(submitError.value).toBeTruthy();

      // Second submission - should clear error
      await submit({ test: 'data' });

      expect(submitError.value).toBe('');
    });

    it('should call submitFn with provided data', async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined);
      const testData = { name: 'Test Property', price: 100000 };

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      await submit(testData);

      expect(submitFn).toHaveBeenCalledWith(testData);
    });

    it('should show success toast on successful submission', async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined);

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Property created successfully',
        successRoute: '/properties'
      });

      await submit({ test: 'data' });

      expect(mockToast.success).toHaveBeenCalledWith('Property created successfully');
    });

    it('should navigate to success route on successful submission', async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined);

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/properties'
      });

      await submit({ test: 'data' });

      expect(mockRouter.push).toHaveBeenCalledWith('/properties');
    });

    it('should show error toast on failed submission', async () => {
      const submitFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success',
        errorMessage: 'Custom error message'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(mockToast.error).toHaveBeenCalledWith('Custom error message');
    });

    it('should use default error message when not provided', async () => {
      const submitFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(mockToast.error).toHaveBeenCalledWith('Submission failed. Please try again.');
    });

    it('should set submitError on failed submission', async () => {
      const submitFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { submitError, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success',
        errorMessage: 'Custom error'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(submitError.value).toBe('Custom error');
    });

    it('should extract error from API response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Invalid property data'
          }
        }
      };
      const submitFn = vi.fn().mockRejectedValue(apiError);

      const { submitError, submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success',
        errorMessage: 'Fallback error'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(submitError.value).toBe('Invalid property data');
      expect(extractErrorMessage).toHaveBeenCalled();
    });

    it('should not navigate on failed submission', async () => {
      const submitFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      try {
        await submit({ test: 'data' });
      } catch {
        // Expected to throw
      }

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should re-throw error for caller to handle', async () => {
      const submitError = new Error('Submission failed');
      const submitFn = vi.fn().mockRejectedValue(submitError);

      const { submit } = useFormSubmission(submitFn, {
        successMessage: 'Success!',
        successRoute: '/success'
      });

      await expect(submit({ test: 'data' })).rejects.toThrow('Submission failed');
    });

    it('should handle complete successful flow', async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined);
      const testData = { name: 'Test' };

      const { submitError, isSubmitting, submit } = useFormSubmission(submitFn, {
        successMessage: 'Created successfully',
        successRoute: '/list'
      });

      await submit(testData);

      expect(submitFn).toHaveBeenCalledWith(testData);
      expect(mockToast.success).toHaveBeenCalledWith('Created successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/list');
      expect(submitError.value).toBe('');
      expect(isSubmitting.value).toBe(false);
    });
  });
});
