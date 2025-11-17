import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

/**
 * High-level auth composable with routing and user feedback
 * Use in components that need logout, not in auth forms
 */
export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();

  /**
   * Logout user with feedback and navigation
   */
  const logout = async () => {
    authStore.logout();
    toast.success('Logged out successfully');
    await router.push('/login');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  /**
   * Get current user
   */
  const user = computed(() => authStore.user);

  return {
    logout,
    isAuthenticated,
    user
  };
}
