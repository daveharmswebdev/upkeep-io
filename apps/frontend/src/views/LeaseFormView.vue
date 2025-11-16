<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <h1 class="text-3xl font-heading font-bold mb-6 text-gray-800">Add Lease</h1>

        <form @submit="onSubmit">
          <!-- Lease Details Section -->
          <div class="mb-6">
            <h2 class="text-xl font-heading font-semibold mb-4 text-gray-700">Lease Details</h2>

            <FormInput
              name="startDate"
              label="Start Date"
              type="date"
              :required="true"
            />

            <FormInput
              name="endDate"
              label="End Date (Optional)"
              type="date"
            />

            <div class="mb-4">
              <label for="monthlyRent" class="block mb-2 text-gray-700 font-medium">
                Monthly Rent (Optional)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  step="0.01"
                  :value="values.monthlyRent"
                  @input="handleMoneyInput('monthlyRent', $event)"
                  placeholder="0.00"
                  class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors"
                  :class="{
                    'border-gray-300 focus:border-complement-300 focus:ring-2 focus:ring-complement-200': !errors.monthlyRent,
                    'border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200': errors.monthlyRent,
                  }"
                />
              </div>
              <p v-if="errors.monthlyRent" class="text-primary-400 text-sm mt-1">{{ errors.monthlyRent }}</p>
            </div>

            <div class="mb-4">
              <label for="securityDeposit" class="block mb-2 text-gray-700 font-medium">
                Security Deposit (Optional)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  step="0.01"
                  :value="values.securityDeposit"
                  @input="handleMoneyInput('securityDeposit', $event)"
                  placeholder="0.00"
                  class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors"
                  :class="{
                    'border-gray-300 focus:border-complement-300 focus:ring-2 focus:ring-complement-200': !errors.securityDeposit,
                    'border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200': errors.securityDeposit,
                  }"
                />
              </div>
              <p v-if="errors.securityDeposit" class="text-primary-400 text-sm mt-1">{{ errors.securityDeposit }}</p>
            </div>

            <FormInput
              name="depositPaidDate"
              label="Deposit Paid Date (Optional)"
              type="date"
            />

            <div class="mb-4">
              <label for="notes" class="block mb-2 text-gray-700 font-medium">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                :value="values.notes"
                @input="handleTextareaInput"
                placeholder="Additional lease notes..."
                rows="3"
                class="w-full px-3 py-2 border rounded focus:outline-none transition-colors"
                :class="{
                  'border-gray-300 focus:border-complement-300 focus:ring-2 focus:ring-complement-200': !errors.notes,
                  'border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200': errors.notes,
                }"
              ></textarea>
              <p v-if="errors.notes" class="text-primary-400 text-sm mt-1">{{ errors.notes }}</p>
            </div>
          </div>

          <!-- Lessee Section -->
          <div class="mb-6">
            <h2 class="text-xl font-heading font-semibold mb-4 text-gray-700">
              Lessee <span class="text-primary-400">*</span>
            </h2>

            <FormInput
              name="lessees[0].firstName"
              label="First Name"
              placeholder="John"
              :required="true"
            />

            <FormInput
              name="lessees[0].lastName"
              label="Last Name"
              placeholder="Doe"
              :required="true"
            />

            <FormInput
              name="lessees[0].middleName"
              label="Middle Name (Optional)"
              placeholder="M"
            />

            <FormInput
              name="lessees[0].email"
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              :required="true"
            />

            <FormInput
              name="lessees[0].phone"
              label="Phone"
              type="tel"
              placeholder="555-123-4567"
              :required="true"
            />

            <FormInput
              name="lessees[0].signedDate"
              label="Signed Date (Optional)"
              type="date"
            />
          </div>

          <div v-if="submitError" class="mb-4 p-3 bg-primary-100 text-primary-500 rounded">
            {{ submitError }}
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting"
              class="flex-1 px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Lease' }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors"
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
import { useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createLeaseSchema } from '@validators/lease';
import { useLeaseStore } from '@/stores/lease';
import FormInput from '@/components/FormInput.vue';
import { convertFormDates, convertNestedDates } from '@/utils/dateHelpers';
import { useFormSubmission } from '@/composables/useFormSubmission';
import { useMoneyInput } from '@/composables/useMoneyInput';
import { useTextareaInput } from '@/composables/useTextareaInput';

const router = useRouter();
const route = useRoute();
const leaseStore = useLeaseStore();

// Get propertyId from route params
const propertyId = route.params.id as string;

const { handleSubmit, errors, values, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createLeaseSchema),
  validateOnMount: false,
  initialValues: {
    propertyId: propertyId,
    lessees: [{}], // Initialize with one empty lessee
  },
});

const { createMoneyInputHandler } = useMoneyInput();
const handleMonthlyRentInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'monthlyRent');
const handleSecurityDepositInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'securityDeposit');

const { createTextareaHandler } = useTextareaInput();
const handleTextareaInput = createTextareaHandler(setFieldValue as (field: string, value: any) => void, 'notes');

const handleMoneyInput = (fieldName: 'monthlyRent' | 'securityDeposit', event: Event) => {
  if (fieldName === 'monthlyRent') {
    handleMonthlyRentInput(event);
  } else {
    handleSecurityDepositInput(event);
  }
};

const { submitError, isSubmitting, submit } = useFormSubmission(
  async (formValues: any) => {
    const data = {
      ...convertFormDates(formValues, ['startDate', 'endDate', 'depositPaidDate']),
      lessees: convertNestedDates(formValues.lessees, ['signedDate']),
    };
    await leaseStore.createLease(data);
  },
  {
    successMessage: 'Lease created successfully',
    successRoute: `/properties/${propertyId}`,
    errorMessage: 'Failed to create lease. Please try again.'
  }
);

const onSubmit = handleSubmit(submit);

const handleCancel = () => {
  router.push(`/properties/${propertyId}`);
};
</script>
