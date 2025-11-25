<template>
  <div class="border-2 border-secondary-1-300 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800">
    <!-- Header with Remove Button -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300">
        Lessee {{ index + 1 }}
      </h3>
      <button
        v-if="showRemove"
        type="button"
        @click="handleRemove"
        class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1"
        :aria-label="`Remove lessee ${index + 1}`"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <FormInput
        :name="`lessees[${index}].firstName`"
        label="First Name"
        placeholder="John"
        :required="true"
      />

      <FormInput
        :name="`lessees[${index}].lastName`"
        label="Last Name"
        placeholder="Doe"
        :required="true"
      />

      <FormInput
        :name="`lessees[${index}].middleName`"
        label="Middle Name (Optional)"
        placeholder="M"
      />

      <FormInput
        :name="`lessees[${index}].email`"
        label="Email"
        type="email"
        placeholder="john.doe@example.com"
        :required="true"
      />

      <FormInput
        :name="`lessees[${index}].phone`"
        label="Phone"
        type="tel"
        placeholder="555-123-4567"
        :required="true"
      />

      <FormInput
        :name="`lessees[${index}].signedDate`"
        label="Signed Date (Optional)"
        type="date"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FormInput from './FormInput.vue';

interface Props {
  index: number;
  showRemove: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [index: number];
}>();

const handleRemove = () => {
  emit('remove', props.index);
};
</script>
