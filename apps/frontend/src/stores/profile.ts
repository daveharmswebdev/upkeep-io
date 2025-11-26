import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Profile } from '@domain/entities';
import type { UpdateProfileInput } from '@validators/profile';
import api from '@/api/client';
import { extractErrorMessage } from '@/utils/errorHandlers';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref('');

  /**
   * Computed full name: firstName + lastName, or email fallback
   */
  const fullName = computed(() => {
    if (!profile.value) return '';

    const firstName = profile.value.firstName?.trim();
    const lastName = profile.value.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }

    // Fallback to email if available (from user object in auth store)
    return '';
  });

  /**
   * Fetch user profile
   */
  async function fetchProfile() {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get<Profile>('/profile');
      profile.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch profile');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(data: UpdateProfileInput) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.put<Profile>('/profile', data);
      profile.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to update profile');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear profile data (on logout)
   */
  function clearProfile() {
    profile.value = null;
    error.value = '';
    loading.value = false;
  }

  return {
    profile,
    loading,
    error,
    fullName,
    fetchProfile,
    updateProfile,
    clearProfile,
  };
});
