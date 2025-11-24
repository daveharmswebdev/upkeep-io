<template>
  <div class="mb-4">
    <label v-if="label" :for="name" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
      {{ label }}
      <span v-if="required" class="text-primary-400 dark:text-primary-300">*</span>
    </label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :required="required"
      @input="handleInput"
      @blur="handleBlur"
      class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      :class="{
        'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errorMessage,
        'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errorMessage,
      }"
    />
    <p v-if="errorMessage" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { toRef } from 'vue';

interface Props {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
});

const name = toRef(props, 'name');

const {
  value,
  errorMessage,
  handleBlur,
  handleChange,
} = useField(name, undefined, {
  validateOnValueUpdate: false,
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  handleChange(target.value);
};
</script>
