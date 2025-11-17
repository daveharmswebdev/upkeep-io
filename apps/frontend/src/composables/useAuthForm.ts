import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { extractErrorMessage } from '@/utils/errorHandlers';

/**
 * Composable for authentication form handling
 * Provides loading states, error handling, and navigation for login/signup
 */
export function useAuthForm() {
  const router = useRouter();
  const loading = ref(false);
  const error = ref('');

  /**
   * Submit authentication form
   * @param authFn - Function that performs the auth operation (login/signup)
   * @param redirectPath - Where to navigate on success (default: /dashboard)
   * @param errorMessage - Fallback error message
   */
  const submitAuth = async (
    authFn: () => Promise<void>,
    redirectPath: string = '/dashboard',
    errorMessage: string = 'Authentication failed. Please try again.'
  ) => {
    loading.value = true;
    error.value = '';

    try {
      await authFn();
      await router.push(redirectPath);
    } catch (err: any) {
      error.value = extractErrorMessage(err, errorMessage);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    submitAuth
  };
}
