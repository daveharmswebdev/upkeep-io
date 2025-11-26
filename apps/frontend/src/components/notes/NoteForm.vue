<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
    <form @submit="onSubmit">
      <div class="space-y-3">
        <label for="note-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ isEdit ? 'Edit Note' : 'Add Note' }}
        </label>
        <textarea
          id="note-content"
          name="content"
          :value="values.content"
          @input="handleInput"
          @blur="handleBlur"
          rows="4"
          placeholder="Enter your note here..."
          class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          :class="{
            'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.content,
            'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.content,
          }"
        ></textarea>
        <p v-if="errors.content" class="text-primary-400 dark:text-primary-300 text-sm">{{ errors.content }}</p>

        <div class="flex justify-end gap-2">
          <button
            v-if="isEdit"
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!meta.valid || isSubmitting"
            class="px-4 py-2 text-sm bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? 'Saving...' : (isEdit ? 'Save' : 'Add Note') }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createNoteSchema, updateNoteSchema } from '@validators/note';

interface Props {
  initialContent?: string;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialContent: '',
  isEdit: false,
});

const emit = defineEmits<{
  submit: [content: string];
  cancel: [];
}>();

// Use appropriate schema based on edit mode
const validationSchema = props.isEdit ? updateNoteSchema : createNoteSchema.pick({ content: true });

const { handleSubmit, errors, values, meta, setFieldValue, resetForm } = useForm({
  validationSchema: toTypedSchema(validationSchema),
  initialValues: {
    content: props.initialContent,
  },
});

const isSubmitting = ref(false);

// Watch for initialContent changes (for edit mode)
watch(() => props.initialContent, (newValue) => {
  setFieldValue('content', newValue);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  setFieldValue('content', target.value);
};

const handleBlur = () => {
  // Trigger validation on blur
};

const submit = async (formValues: any) => {
  isSubmitting.value = true;
  try {
    emit('submit', formValues.content.trim());
    if (!props.isEdit) {
      // Reset form after successful submission (only for create mode)
      resetForm();
    }
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmit = handleSubmit(submit);

const handleCancel = () => {
  emit('cancel');
};
</script>
