<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleCancel"
    @keydown.esc="handleCancel"
  >
    <div
      ref="modalRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <h2 id="modal-title" class="text-xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
        Add Occupant to Lease
      </h2>

      <form @submit="onSubmit">
        <!-- Is Adult Checkbox -->
        <div class="mb-6">
          <div class="flex items-center">
            <input
              id="isAdult"
              name="isAdult"
              type="checkbox"
              :checked="values.isAdult"
              @change="handleIsAdultChange"
              class="w-4 h-4 text-complement-400 bg-gray-100 border-gray-300 rounded focus:ring-complement-300 dark:focus:ring-complement-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label for="isAdult" class="ml-2 text-gray-700 dark:text-gray-300 font-medium">
              Is Adult (18+)
            </label>
          </div>
          <p v-if="errors.isAdult" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.isAdult }}</p>
        </div>

        <!-- Occupant Information -->
        <div class="mb-6">
          <h3 class="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Occupant Information
          </h3>
          <div class="space-y-4">
            <FormInput
              name="firstName"
              label="First Name"
              placeholder="John"
              :required="true"
            />

            <FormInput
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              :required="true"
            />

            <FormInput
              name="middleName"
              label="Middle Name (Optional)"
              placeholder="M"
            />

            <FormInput
              name="email"
              :label="values.isAdult ? 'Email' : 'Email (Optional)'"
              type="email"
              placeholder="john.doe@example.com"
              :required="values.isAdult"
            />

            <FormInput
              name="phone"
              :label="values.isAdult ? 'Phone' : 'Phone (Optional)'"
              type="tel"
              placeholder="555-123-4567"
              :required="values.isAdult"
            />

            <FormInput
              name="moveInDate"
              label="Move In Date (Optional)"
              type="date"
            />

            <div>
              <label for="notes" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                :value="values.notes"
                @input="handleNotesInput"
                @blur="handleBlur"
                placeholder="Additional notes about this occupant..."
                rows="3"
                class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                :class="{
                  'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.notes,
                  'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.notes,
                }"
              ></textarea>
              <p v-if="errors.notes" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="mb-4 p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 rounded dark:border dark:border-primary-700">
          {{ submitError }}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 justify-end">
          <button
            ref="cancelButtonRef"
            type="button"
            class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            @click="handleCancel"
          >
            Cancel
          </button>
          <button
            ref="confirmButtonRef"
            type="submit"
            :disabled="!meta.valid || isSubmitting"
            class="px-6 py-2 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-complement-500"
          >
            {{ isSubmitting ? 'Adding...' : 'Add Occupant' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { addOccupantSchema, type AddOccupantInput } from '@validators/lease/addOccupant';
import FormInput from './FormInput.vue';

const emit = defineEmits<{
  confirm: [data: AddOccupantInput];
  cancel: [];
}>();

// Initialize form with default values
const { handleSubmit, errors, values, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(addOccupantSchema),
  initialValues: {
    isAdult: false,
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    moveInDate: undefined,
    notes: '',
  },
});

const isSubmitting = ref(false);
const submitError = ref('');

const modalRef = ref<HTMLElement | null>(null);
const cancelButtonRef = ref<HTMLButtonElement | null>(null);
const confirmButtonRef = ref<HTMLButtonElement | null>(null);

const handleIsAdultChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  setFieldValue('isAdult', target.checked);
};

const handleNotesInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  setFieldValue('notes', target.value);
};

const handleBlur = () => {
  // Trigger validation on blur
};

const submit = async (formValues: any) => {
  submitError.value = '';
  isSubmitting.value = true;

  try {
    emit('confirm', formValues as AddOccupantInput);
  } catch (error: any) {
    submitError.value = error.message || 'An error occurred';
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmit = handleSubmit(submit);

const handleCancel = () => {
  emit('cancel');
};

const handleTabKey = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;

  const focusableElements = [cancelButtonRef.value, confirmButtonRef.value].filter(Boolean);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) return;

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

onMounted(() => {
  if (cancelButtonRef.value) {
    cancelButtonRef.value.focus();
  }
  document.addEventListener('keydown', handleTabKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleTabKey);
});
</script>
