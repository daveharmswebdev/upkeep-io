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
      class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
    >
      <h2 id="modal-title" class="text-xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
        Add Pet to Lease
      </h2>

      <form @submit="onSubmit">
        <!-- Pet Information -->
        <div class="mb-6">
          <div class="space-y-4">
            <FormInput
              name="name"
              label="Pet Name"
              placeholder="Fluffy"
              :required="true"
            />

            <div>
              <label for="species" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Species <span class="text-primary-400 dark:text-primary-300">*</span>
              </label>
              <select
                id="species"
                name="species"
                :value="values.species"
                @change="handleSpeciesChange"
                class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                :class="{
                  'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.species,
                  'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.species,
                }"
              >
                <option value="">Select species...</option>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
              </select>
              <p v-if="errors.species" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.species }}</p>
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
            {{ isSubmitting ? 'Adding...' : 'Add Pet' }}
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
import { addPetSchema, type AddPetInput } from '@validators/lease';
import FormInput from './FormInput.vue';

const emit = defineEmits<{
  confirm: [data: AddPetInput];
  cancel: [];
}>();

const { handleSubmit, errors, values, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(addPetSchema),
  initialValues: {
    name: '',
    species: undefined as 'cat' | 'dog' | undefined,
  },
});

const isSubmitting = ref(false);
const submitError = ref('');

const modalRef = ref<HTMLElement | null>(null);
const cancelButtonRef = ref<HTMLButtonElement | null>(null);
const confirmButtonRef = ref<HTMLButtonElement | null>(null);

const handleSpeciesChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  setFieldValue('species', target.value as 'cat' | 'dog');
};

const submit = async (formValues: any) => {
  submitError.value = '';
  isSubmitting.value = true;

  try {
    emit('confirm', formValues as AddPetInput);
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
