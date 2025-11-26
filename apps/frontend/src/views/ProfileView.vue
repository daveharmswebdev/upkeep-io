<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
    <div class="max-w-2xl mx-auto px-2 sm:px-4">
      <div class="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg shadow-lg dark:border dark:border-gray-700">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-heading font-bold text-gray-800 dark:text-gray-100">
            My Profile
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Update your personal information
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="fetchLoading" class="flex justify-center items-center py-12">
          <div class="text-gray-600 dark:text-gray-400">Loading profile...</div>
        </div>

        <!-- Fetch Error State -->
        <div v-else-if="fetchError" class="mb-6 p-4 bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 rounded dark:border dark:border-primary-700">
          {{ fetchError }}
        </div>

        <!-- Profile Form -->
        <form v-else @submit="onSubmit">
          <div class="space-y-4">
            <!-- Email (read-only) -->
            <div class="mb-4">
              <label for="email" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                :value="user?.email"
                readonly
                disabled
                class="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-600"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <!-- First Name -->
            <FormInput
              name="firstName"
              label="First Name"
              placeholder="John"
            />

            <!-- Last Name -->
            <FormInput
              name="lastName"
              label="Last Name"
              placeholder="Doe"
            />

            <!-- Phone -->
            <FormInput
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
            />
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="mt-4 mb-4 p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 rounded dark:border dark:border-primary-700">
            {{ submitError }}
          </div>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting || !meta.dirty"
              class="w-full sm:flex-1 px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-complement-300 focus:ring-offset-2"
            >
              <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ isSubmitting ? 'Updating...' : 'Save Changes' }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              :disabled="!meta.dirty"
              class="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'vue-toastification';
import { updateProfileSchema } from '@validators/profile';
import { useProfileStore } from '@/stores/profile';
import { useAuth } from '@/composables/useAuth';
import FormInput from '@/components/FormInput.vue';
import { extractErrorMessage } from '@/utils/errorHandlers';

const toast = useToast();
const profileStore = useProfileStore();
const { user } = useAuth();

const { handleSubmit, meta, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(updateProfileSchema),
  validateOnMount: false,
});

// Separate error states
const fetchLoading = ref(false);
const fetchError = ref('');
const submitError = ref('');
const isSubmitting = ref(false);

/**
 * Submit form handler
 */
const submit = async (formValues: any) => {
  submitError.value = '';
  isSubmitting.value = true;

  try {
    await profileStore.updateProfile(formValues);
    toast.success('Profile updated successfully');

    // Reset form to mark it as not dirty
    resetForm({ values: formValues });
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to update profile. Please try again.');
    submitError.value = errorMsg;
    toast.error(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmit = handleSubmit(submit);

/**
 * Cancel changes and reset form
 */
function handleCancel() {
  if (profileStore.profile) {
    setValues({
      firstName: profileStore.profile.firstName || '',
      lastName: profileStore.profile.lastName || '',
      phone: profileStore.profile.phone || '',
    });
  }
}

/**
 * Fetch profile data on mount
 */
onMounted(async () => {
  fetchLoading.value = true;
  fetchError.value = '';

  try {
    await profileStore.fetchProfile();

    // Pre-populate form with existing profile data
    if (profileStore.profile) {
      setValues({
        firstName: profileStore.profile.firstName || '',
        lastName: profileStore.profile.lastName || '',
        phone: profileStore.profile.phone || '',
      });
    }
  } catch (err: any) {
    fetchError.value = extractErrorMessage(err, 'Failed to load profile. Please try again.');
  } finally {
    fetchLoading.value = false;
  }
});
</script>
