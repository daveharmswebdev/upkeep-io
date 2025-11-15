<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <h1 class="text-3xl font-heading font-bold mb-6 text-gray-800">Add Property</h1>

        <form @submit="onSubmit">
          <FormInput
            name="address"
            label="Address"
            placeholder="123 Main St"
            :required="true"
          />

          <FormInput
            name="city"
            label="City"
            placeholder="San Francisco"
            :required="true"
          />

          <FormInput
            name="state"
            label="State"
            placeholder="CA"
            :required="true"
          />

          <FormInput
            name="zipCode"
            label="ZIP Code"
            placeholder="94102"
            :required="true"
          />

          <FormInput
            name="nickname"
            label="Nickname (Optional)"
            placeholder="Downtown Apartment"
          />

          <FormInput
            name="purchaseDate"
            label="Purchase Date (Optional)"
            type="date"
          />

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

          <div v-if="submitError" class="mb-4 p-3 bg-primary-100 text-primary-500 rounded">
            {{ submitError }}
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting"
              class="flex-1 px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Property' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createPropertySchema } from '@validators/property';
import { usePropertyStore } from '@/stores/property';
import { useToast } from 'vue-toastification';
import FormInput from '@/components/FormInput.vue';

const router = useRouter();
const propertyStore = usePropertyStore();
const toast = useToast();
const submitError = ref('');

const { handleSubmit, errors, values, meta, isSubmitting, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createPropertySchema),
  validateOnMount: false,
});

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value ? parseFloat(target.value) : undefined;
  setFieldValue('purchasePrice', value);
};

const onSubmit = handleSubmit(async (formValues) => {
  submitError.value = '';
  try {
    // Convert date string to Date object if provided
    const data = {
      ...formValues,
      purchaseDate: formValues.purchaseDate ? new Date(formValues.purchaseDate) : undefined,
    };

    await propertyStore.createProperty(data);
    toast.success('Property created successfully');
    router.push('/properties');
  } catch (err: any) {
    submitError.value = err.response?.data?.error || 'Failed to create property. Please try again.';
    toast.error(submitError.value);
  }
});

const handleCancel = () => {
  router.push('/properties');
};
</script>
