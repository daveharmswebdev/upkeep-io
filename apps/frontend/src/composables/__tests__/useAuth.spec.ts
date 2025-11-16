import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}));

vi.mock('vue-toastification', () => ({
  useToast: vi.fn()
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}));

import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

describe('useAuth', () => {
  let mockRouter: any;
  let mockToast: any;
  let mockAuthStore: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockRouter = {
      push: vi.fn().mockResolvedValue(undefined)
    };

    mockToast = {
      success: vi.fn()
    };

    mockAuthStore = {
      logout: vi.fn(),
      isAuthenticated: false,
      user: null
    };

    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore);
  });

  describe('logout', () => {
    it('should call authStore.logout', async () => {
      const { logout } = useAuth();

      await logout();

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should show success toast', async () => {
      const { logout } = useAuth();

      await logout();

      expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully');
    });

    it('should navigate to login page', async () => {
      const { logout } = useAuth();

      await logout();

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should complete full logout flow', async () => {
      const { logout } = useAuth();

      await logout();

      // Verify order of operations
      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not authenticated', () => {
      mockAuthStore.isAuthenticated = false;

      const { isAuthenticated } = useAuth();

      expect(isAuthenticated.value).toBe(false);
    });

    it('should return true when authenticated', () => {
      mockAuthStore.isAuthenticated = true;

      const { isAuthenticated } = useAuth();

      expect(isAuthenticated.value).toBe(true);
    });
  });

  describe('user', () => {
    it('should return null when no user', () => {
      mockAuthStore.user = null;

      const { user } = useAuth();

      expect(user.value).toBeNull();
    });

    it('should return user object when authenticated', () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      };
      mockAuthStore.user = mockUser;

      const { user } = useAuth();

      expect(user.value).toEqual(mockUser);
    });
  });
});
