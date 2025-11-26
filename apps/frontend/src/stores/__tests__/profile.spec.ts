import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProfileStore } from '../profile';
import type { Profile } from '@domain/entities';

// Mock dependencies
vi.mock('@/api/client');
vi.mock('@/utils/errorHandlers');

import api from '@/api/client';
import * as errorHandlers from '@/utils/errorHandlers';

describe('useProfileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(errorHandlers.extractErrorMessage).mockImplementation((err, fallback) => {
      return err?.response?.data?.error || err?.message || fallback;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have null profile', () => {
      const store = useProfileStore();
      expect(store.profile).toBeNull();
    });

    it('should have loading false', () => {
      const store = useProfileStore();
      expect(store.loading).toBe(false);
    });

    it('should have empty error', () => {
      const store = useProfileStore();
      expect(store.error).toBe('');
    });

    it('should have empty fullName when profile is null', () => {
      const store = useProfileStore();
      expect(store.fullName).toBe('');
    });
  });

  describe('fullName computed', () => {
    it('should return firstName + lastName when both present', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('John Doe');
    });

    it('should return firstName only when lastName missing', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('John');
    });

    it('should return lastName only when firstName missing', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('Doe');
    });

    it('should return empty string when both names missing', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('');
    });

    it('should handle whitespace-only names', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: '   ',
        lastName: '   ',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('');
    });

    it('should trim whitespace from names', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: '  John  ',
        lastName: '  Doe  ',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(store.fullName).toBe('John Doe');
    });
  });

  describe('fetchProfile', () => {
    it('should set loading to true during fetch', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

      const fetchPromise = store.fetchProfile();
      expect(store.loading).toBe(true);

      await fetchPromise;
    });

    it('should set loading to false after successful fetch', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

      await store.fetchProfile();

      expect(store.loading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      const store = useProfileStore();
      vi.mocked(api.get).mockRejectedValue({ message: 'Network error' });

      try {
        await store.fetchProfile();
      } catch {
        // Expected to throw
      }

      expect(store.loading).toBe(false);
    });

    it('should clear error on new fetch', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First fetch - set error
      vi.mocked(api.get).mockRejectedValueOnce({ message: 'Failed' });
      try {
        await store.fetchProfile();
      } catch {
        // Expected to throw
      }
      expect(store.error).toBe('Failed');

      // Second fetch - should clear error
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockProfile });
      await store.fetchProfile();

      expect(store.error).toBe('');
    });

    it('should fetch profile from correct endpoint', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

      await store.fetchProfile();

      expect(api.get).toHaveBeenCalledWith('/profile');
    });

    it('should set profile on successful fetch', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

      const result = await store.fetchProfile();

      expect(store.profile).toEqual(mockProfile);
      expect(result).toEqual(mockProfile);
    });

    it('should set error on fetch failure', async () => {
      const store = useProfileStore();
      vi.mocked(api.get).mockRejectedValue({ message: 'Network error' });

      try {
        await store.fetchProfile();
      } catch {
        // Expected to throw
      }

      expect(store.error).toBe('Network error');
      expect(errorHandlers.extractErrorMessage).toHaveBeenCalled();
    });

    it('should use fallback error message', async () => {
      const store = useProfileStore();
      vi.mocked(api.get).mockRejectedValue({});

      try {
        await store.fetchProfile();
      } catch {
        // Expected to throw
      }

      expect(store.error).toBe('Failed to fetch profile');
    });

    it('should re-throw error for caller to handle', async () => {
      const store = useProfileStore();
      const fetchError = { message: 'Fetch failed' };
      vi.mocked(api.get).mockRejectedValue(fetchError);

      await expect(store.fetchProfile()).rejects.toEqual(fetchError);
    });
  });

  describe('updateProfile', () => {
    it('should set loading to true during update', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockProfile });

      const updatePromise = store.updateProfile({ firstName: 'Jane', lastName: 'Smith' });
      expect(store.loading).toBe(true);

      await updatePromise;
    });

    it('should set loading to false after successful update', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockProfile });

      await store.updateProfile({ firstName: 'Jane' });

      expect(store.loading).toBe(false);
    });

    it('should set loading to false after failed update', async () => {
      const store = useProfileStore();
      vi.mocked(api.put).mockRejectedValue({ message: 'Network error' });

      try {
        await store.updateProfile({ firstName: 'Jane' });
      } catch {
        // Expected to throw
      }

      expect(store.loading).toBe(false);
    });

    it('should clear error on new update', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First update - set error
      vi.mocked(api.put).mockRejectedValueOnce({ message: 'Failed' });
      try {
        await store.updateProfile({ firstName: 'Jane' });
      } catch {
        // Expected to throw
      }
      expect(store.error).toBe('Failed');

      // Second update - should clear error
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockProfile });
      await store.updateProfile({ firstName: 'Jane' });

      expect(store.error).toBe('');
    });

    it('should update profile via correct endpoint with data', async () => {
      const store = useProfileStore();
      const updateData = { firstName: 'Jane', lastName: 'Smith', phone: '0987654321' };
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockProfile });

      await store.updateProfile(updateData);

      expect(api.put).toHaveBeenCalledWith('/profile', updateData);
    });

    it('should update profile state on successful update', async () => {
      const store = useProfileStore();
      const mockProfile: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockProfile });

      const result = await store.updateProfile({ firstName: 'Jane', lastName: 'Smith', phone: '0987654321' });

      expect(store.profile).toEqual(mockProfile);
      expect(result).toEqual(mockProfile);
    });

    it('should set error on update failure', async () => {
      const store = useProfileStore();
      vi.mocked(api.put).mockRejectedValue({ message: 'Update failed' });

      try {
        await store.updateProfile({ firstName: 'Jane' });
      } catch {
        // Expected to throw
      }

      expect(store.error).toBe('Update failed');
      expect(errorHandlers.extractErrorMessage).toHaveBeenCalled();
    });

    it('should use fallback error message on update failure', async () => {
      const store = useProfileStore();
      vi.mocked(api.put).mockRejectedValue({});

      try {
        await store.updateProfile({ firstName: 'Jane' });
      } catch {
        // Expected to throw
      }

      expect(store.error).toBe('Failed to update profile');
    });

    it('should re-throw error for caller to handle', async () => {
      const store = useProfileStore();
      const updateError = { message: 'Update failed' };
      vi.mocked(api.put).mockRejectedValue(updateError);

      await expect(store.updateProfile({ firstName: 'Jane' })).rejects.toEqual(updateError);
    });
  });

  describe('clearProfile', () => {
    it('should clear profile data', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.clearProfile();

      expect(store.profile).toBeNull();
    });

    it('should clear error', () => {
      const store = useProfileStore();
      store.error = 'Some error';

      store.clearProfile();

      expect(store.error).toBe('');
    });

    it('should reset loading state', () => {
      const store = useProfileStore();
      store.loading = true;

      store.clearProfile();

      expect(store.loading).toBe(false);
    });

    it('should clear all state at once', () => {
      const store = useProfileStore();
      store.profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.error = 'Some error';
      store.loading = true;

      store.clearProfile();

      expect(store.profile).toBeNull();
      expect(store.error).toBe('');
      expect(store.loading).toBe(false);
    });
  });
});
