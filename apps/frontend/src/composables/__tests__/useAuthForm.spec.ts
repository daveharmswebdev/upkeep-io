import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthForm } from '../useAuthForm';

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
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
import { extractErrorMessage } from '@/utils/errorHandlers';

describe('useAuthForm', () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn().mockResolvedValue(undefined)
    };

    vi.mocked(useRouter).mockReturnValue(mockRouter);
  });

  describe('submitAuth', () => {
    it('should set loading to true during auth operation', async () => {
      const { loading, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockImplementation(() => {
        expect(loading.value).toBe(true);
        return Promise.resolve();
      });

      await submitAuth(authFn);
    });

    it('should set loading to false after successful auth', async () => {
      const { loading, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockResolvedValue(undefined);

      await submitAuth(authFn);

      expect(loading.value).toBe(false);
    });

    it('should set loading to false after failed auth', async () => {
      const { loading, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockRejectedValue(new Error('Auth failed'));

      await submitAuth(authFn);

      expect(loading.value).toBe(false);
    });

    it('should clear error on new submission', async () => {
      const { error, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockRejectedValue(new Error('Auth failed'));

      // First submission - sets error
      await submitAuth(authFn);
      expect(error.value).toBeTruthy();

      // Second submission - should clear error first
      const successAuthFn = vi.fn().mockResolvedValue(undefined);
      await submitAuth(successAuthFn);

      // Error should be cleared (and stay cleared since auth succeeded)
      expect(error.value).toBe('');
    });

    it('should navigate to default path on success', async () => {
      const { submitAuth } = useAuthForm();
      const authFn = vi.fn().mockResolvedValue(undefined);

      await submitAuth(authFn);

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to custom path on success', async () => {
      const { submitAuth } = useAuthForm();
      const authFn = vi.fn().mockResolvedValue(undefined);

      await submitAuth(authFn, '/properties');

      expect(mockRouter.push).toHaveBeenCalledWith('/properties');
    });

    it('should not navigate on auth failure', async () => {
      const { submitAuth } = useAuthForm();
      const authFn = vi.fn().mockRejectedValue(new Error('Auth failed'));

      await submitAuth(authFn);

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should set error message on auth failure', async () => {
      const { error, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockRejectedValue(
        new Error('Authentication failed')
      );

      await submitAuth(authFn, '/dashboard', 'Custom error message');

      expect(error.value).toBe('Custom error message');
      expect(extractErrorMessage).toHaveBeenCalled();
    });

    it('should extract error from API response', async () => {
      const { error, submitAuth } = useAuthForm();
      const apiError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };
      const authFn = vi.fn().mockRejectedValue(apiError);

      await submitAuth(authFn, '/dashboard', 'Fallback error');

      expect(error.value).toBe('Invalid credentials');
    });

    it('should call auth function', async () => {
      const { submitAuth } = useAuthForm();
      const authFn = vi.fn().mockResolvedValue(undefined);

      await submitAuth(authFn);

      expect(authFn).toHaveBeenCalled();
    });

    it('should handle complete successful flow', async () => {
      const { loading, error, submitAuth } = useAuthForm();
      const authFn = vi.fn().mockResolvedValue(undefined);

      expect(loading.value).toBe(false);
      expect(error.value).toBe('');

      const submitPromise = submitAuth(authFn, '/dashboard');

      await submitPromise;

      expect(authFn).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      expect(loading.value).toBe(false);
      expect(error.value).toBe('');
    });

    it('should handle complete failed flow', async () => {
      const { loading, error, submitAuth } = useAuthForm();
      const authError = {
        response: {
          data: {
            error: 'Login failed'
          }
        }
      };
      const authFn = vi.fn().mockRejectedValue(authError);

      await submitAuth(authFn, '/dashboard', 'Fallback message');

      expect(authFn).toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(loading.value).toBe(false);
      expect(error.value).toBe('Login failed');
    });
  });
});
