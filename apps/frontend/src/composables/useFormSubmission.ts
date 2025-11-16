import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { extractErrorMessage } from '@/utils/errorHandlers';

export interface FormSubmissionOptions {
  successMessage: string;
  successRoute: string;
  errorMessage?: string;
}

/**
 * Composable for handling form submissions with standardized error handling,
 * loading states, and navigation
 */
export function useFormSubmission<T>(
  submitFn: (data: T) => Promise<void>,
  options: FormSubmissionOptions
) {
  const router = useRouter();
  const toast = useToast();

  const submitError = ref('');
  const isSubmitting = ref(false);

  const submit = async (data: T) => {
    submitError.value = '';
    isSubmitting.value = true;

    try {
      await submitFn(data);
      toast.success(options.successMessage);
      await router.push(options.successRoute);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(
        err,
        options.errorMessage || 'Submission failed. Please try again.'
      );
      submitError.value = errorMsg;
      toast.error(errorMsg);
      throw err; // Re-throw for caller to handle if needed
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    submitError,
    isSubmitting,
    submit
  };
}
