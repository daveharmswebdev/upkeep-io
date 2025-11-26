<template>
  <div class="border-2 border-secondary-1-300 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800">
    <!-- Header with Remove Button -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300">
        Occupant {{ index + 1 }}
      </h3>
      <button
        v-if="showRemove"
        type="button"
        @click="handleRemove"
        class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1"
        :aria-label="`Remove occupant ${index + 1}`"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <!-- Is Adult Checkbox -->
      <div class="flex items-center">
        <input
          :id="`occupants-${index}-isAdult`"
          :name="`occupants[${index}].isAdult`"
          type="checkbox"
          :checked="isAdultValue"
          @change="handleIsAdultChange"
          class="w-4 h-4 text-complement-400 bg-gray-100 border-gray-300 rounded focus:ring-complement-300 dark:focus:ring-complement-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label :for="`occupants-${index}-isAdult`" class="ml-2 text-gray-700 dark:text-gray-300 font-medium">
          Is Adult (18+)
        </label>
      </div>

      <FormInput
        :name="`occupants[${index}].firstName`"
        label="First Name"
        placeholder="John"
        :required="true"
      />

      <FormInput
        :name="`occupants[${index}].lastName`"
        label="Last Name"
        placeholder="Doe"
        :required="true"
      />

      <FormInput
        :name="`occupants[${index}].middleName`"
        label="Middle Name (Optional)"
        placeholder="M"
      />

      <FormInput
        :name="`occupants[${index}].email`"
        :label="isAdultValue ? 'Email' : 'Email (Optional)'"
        type="email"
        placeholder="john.doe@example.com"
        :required="isAdultValue"
      />

      <FormInput
        :name="`occupants[${index}].phone`"
        :label="isAdultValue ? 'Phone' : 'Phone (Optional)'"
        type="tel"
        placeholder="555-123-4567"
        :required="isAdultValue"
      />

      <FormInput
        :name="`occupants[${index}].moveInDate`"
        label="Move In Date (Optional)"
        type="date"
      />

      <div>
        <label :for="`occupants-${index}-notes`" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
          Notes (Optional)
        </label>
        <textarea
          :id="`occupants-${index}-notes`"
          :name="`occupants[${index}].notes`"
          placeholder="Additional notes about this occupant..."
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import FormInput from './FormInput.vue';

interface Props {
  index: number;
  showRemove: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [index: number];
}>();

// Track isAdult value to conditionally require email/phone
const { value: isAdultValue } = useField<boolean>(`occupants[${props.index}].isAdult`);

const handleIsAdultChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  isAdultValue.value = target.checked;
};

const handleRemove = () => {
  emit('remove', props.index);
};
</script>
