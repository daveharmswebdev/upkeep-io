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
        Remove Lessee from Lease
      </h2>

      <!-- Warning Banner -->
      <div class="mb-6 p-4 bg-secondary-1-100 dark:bg-secondary-1-900/30 border-l-4 border-secondary-1-400 dark:border-secondary-1-500 rounded">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-secondary-1-500 dark:text-secondary-1-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Important: Lease Will Be Voided</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Removing <strong>{{ lesseeName }}</strong> will void the current lease and create a new one with the remaining lessees.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <form @submit="onSubmit">
        <!-- Void Reason -->
        <div class="mb-6">
          <label for="voidedReason" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
            Reason for Voiding Lease <span class="text-primary-400 dark:text-primary-300">*</span>
          </label>
          <textarea
            id="voidedReason"
            name="voidedReason"
            :value="values.voidedReason"
            @input="handleInput"
            @blur="handleBlur"
            placeholder="e.g., Lessee moved out"
            rows="3"
            class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            :class="{
              'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.voidedReason,
              'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.voidedReason,
            }"
          ></textarea>
          <p v-if="errors.voidedReason" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.voidedReason }}</p>
        </div>

        <!-- New Lease Data Section -->
        <div class="mb-6">
          <h3 class="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-3">
            New Lease Details
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The following fields are pre-populated from the current lease. You can modify them as needed.
          </p>
          <div class="space-y-4">
            <FormInput
              name="newLeaseData.startDate"
              label="Start Date"
              type="date"
              :required="true"
            />

            <FormInput
              name="newLeaseData.endDate"
              label="End Date (Optional)"
              type="date"
            />

            <div>
              <label for="monthlyRent" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Monthly Rent (Optional)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  step="0.01"
                  :value="values.newLeaseData?.monthlyRent"
                  @input="handleMoneyInput"
                  placeholder="0.00"
                  class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  :class="{
                    'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors['newLeaseData.monthlyRent'],
                    'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors['newLeaseData.monthlyRent'],
                  }"
                />
              </div>
              <p v-if="errors['newLeaseData.monthlyRent']" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors['newLeaseData.monthlyRent'] }}</p>
            </div>

            <div>
              <label for="securityDeposit" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Security Deposit (Optional)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  step="0.01"
                  :value="values.newLeaseData?.securityDeposit"
                  @input="handleSecurityDepositInput"
                  placeholder="0.00"
                  class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  :class="{
                    'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors['newLeaseData.securityDeposit'],
                    'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors['newLeaseData.securityDeposit'],
                  }"
                />
              </div>
              <p v-if="errors['newLeaseData.securityDeposit']" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors['newLeaseData.securityDeposit'] }}</p>
            </div>

            <FormInput
              name="newLeaseData.depositPaidDate"
              label="Deposit Paid Date (Optional)"
              type="date"
            />

            <div>
              <label for="notes" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                :value="values.newLeaseData?.notes"
                @input="handleNotesInput"
                @blur="handleBlur"
                placeholder="Additional lease notes..."
                rows="3"
                class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                :class="{
                  'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors['newLeaseData.notes'],
                  'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors['newLeaseData.notes'],
                }"
              ></textarea>
              <p v-if="errors['newLeaseData.notes']" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors['newLeaseData.notes'] }}</p>
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
            class="px-6 py-2 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {{ isSubmitting ? 'Removing...' : 'Remove Lessee' }}
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
import { z } from 'zod';
import type { LeaseWithDetails } from '@domain/entities';
import FormInput from './FormInput.vue';
import { formatDateForInput } from '@/utils/dateHelpers';

// Define schema for remove lessee (similar to addLessee but without newLessee)
const removeLesseeSchema = z.object({
  voidedReason: z.string().min(1, 'Void reason is required'),
  newLeaseData: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
    securityDeposit: z.number().nonnegative('Security deposit must be non-negative').optional(),
    depositPaidDate: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
}).refine(
  (data) => {
    if (data.newLeaseData.startDate && data.newLeaseData.endDate) {
      return data.newLeaseData.startDate < data.newLeaseData.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['newLeaseData', 'endDate'],
  }
);

type RemoveLesseeInput = z.infer<typeof removeLesseeSchema>;

interface Props {
  currentLease: LeaseWithDetails;
  lesseeName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  confirm: [data: RemoveLesseeInput];
  cancel: [];
}>();

// Initialize form with pre-populated data from current lease
const { handleSubmit, errors, values, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(removeLesseeSchema),
  initialValues: {
    voidedReason: '',
    newLeaseData: {
      startDate: formatDateForInput(props.currentLease.startDate) as any,
      endDate: formatDateForInput(props.currentLease.endDate) as any,
      monthlyRent: props.currentLease.monthlyRent,
      securityDeposit: props.currentLease.securityDeposit,
      depositPaidDate: formatDateForInput(props.currentLease.depositPaidDate) as any,
      notes: props.currentLease.notes || '',
    },
  },
});

const isSubmitting = ref(false);
const submitError = ref('');

const modalRef = ref<HTMLElement | null>(null);
const cancelButtonRef = ref<HTMLButtonElement | null>(null);
const confirmButtonRef = ref<HTMLButtonElement | null>(null);

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  setFieldValue('voidedReason', target.value);
};

const handleMoneyInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value ? parseFloat(target.value) : undefined;
  setFieldValue('newLeaseData.monthlyRent', value);
};

const handleSecurityDepositInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value ? parseFloat(target.value) : undefined;
  setFieldValue('newLeaseData.securityDeposit', value);
};

const handleNotesInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  setFieldValue('newLeaseData.notes', target.value);
};

const handleBlur = () => {
  // Trigger validation on blur
};

const submit = async (formValues: any) => {
  submitError.value = '';
  isSubmitting.value = true;

  try {
    emit('confirm', formValues as RemoveLesseeInput);
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
