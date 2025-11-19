<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <div class="bg-white p-4 md:p-6 lg:p-8 rounded-lg shadow-lg">
        <!-- Back Button -->
        <button
          type="button"
          @click="handleCancel"
          class="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </button>

        <h1 class="text-3xl font-heading font-bold mb-6 text-gray-800">Add Property</h1>

        <form @submit="onSubmit">
          <!-- Two-column grid for laptop, single column for mobile/tablet -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Street - Full width on all screens -->
            <div class="lg:col-span-2">
              <FormInput
                name="street"
                label="Street Address"
                placeholder="123 Main St"
                :required="true"
              />
            </div>

            <!-- Address 2 - Full width on all screens -->
            <div class="lg:col-span-2">
              <FormInput
                name="address2"
                label="Address Line 2 (Optional)"
                placeholder="Apt, Suite, Unit, etc."
              />
            </div>

            <!-- Left Column -->
            <FormInput
              name="city"
              label="City"
              placeholder="San Francisco"
              :required="true"
            />

            <!-- Right Column -->
            <FormInput
              name="zipCode"
              label="ZIP Code"
              placeholder="94102"
              :required="true"
            />

            <!-- Left Column -->
            <FormInput
              name="state"
              label="State"
              placeholder="CA"
              :required="true"
            />

            <!-- Right Column -->
            <FormInput
              name="purchaseDate"
              label="Purchase Date (Optional)"
              type="date"
            />

            <!-- Left Column -->
            <FormInput
              name="nickname"
              label="Nickname (Optional)"
              placeholder="Downtown Apartment"
            />

            <!-- Right Column - Money input -->
            <div class="mb-4">
            <label for="purchasePrice" class="block mb-2 text-gray-700 font-medium">
              Purchase Price (Optional)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                :value="values.purchasePrice"
                @input="handlePriceInput"
                placeholder="0.00"
                class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors"
                :class="{
                  'border-gray-300 focus:border-complement-300 focus:ring-2 focus:ring-complement-200': !errors.purchasePrice,
                  'border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200': errors.purchasePrice,
                }"
              />
            </div>
            <p v-if="errors.purchasePrice" class="text-primary-400 text-sm mt-1">{{ errors.purchasePrice }}</p>
            </div>
          </div>

          <!-- Error Message and Buttons - Full width below grid -->
          <div v-if="submitError" class="mt-4 mb-4 p-3 bg-primary-100 text-primary-500 rounded">
            {{ submitError }}
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting"
              class="w-full sm:flex-1 px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-complement-300 focus:ring-offset-2"
            >
              <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ isSubmitting ? 'Creating...' : 'Create Property' }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              class="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
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
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createPropertySchema } from '@validators/property';
import { usePropertyStore } from '@/stores/property';
import FormInput from '@/components/FormInput.vue';
import { convertFormDates } from '@/utils/dateHelpers';
import { useFormSubmission } from '@/composables/useFormSubmission';
import { useMoneyInput } from '@/composables/useMoneyInput';
import type { CreatePropertyData } from '@domain/entities';

const router = useRouter();
const propertyStore = usePropertyStore();

const { handleSubmit, errors, values, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createPropertySchema),
  validateOnMount: false,
});

const { createMoneyInputHandler } = useMoneyInput();
const handlePriceInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'purchasePrice');

const { submitError, isSubmitting, submit } = useFormSubmission(
  async (formValues: any) => {
    const data = convertFormDates(formValues, ['purchaseDate']) as Omit<CreatePropertyData, 'userId'>;
    await propertyStore.createProperty(data);
  },
  {
    successMessage: 'Property created successfully',
    successRoute: '/properties',
    errorMessage: 'Failed to create property. Please try again.'
  }
);

const onSubmit = handleSubmit(submit);

const handleCancel = () => {
  router.push('/properties');
};
</script>
