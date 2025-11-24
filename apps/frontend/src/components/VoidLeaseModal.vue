<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="handleCancel"
    @keydown.esc="handleCancel"
  >
    <div
      ref="modalRef"
      role="dialog"
      aria-modal="true"
      class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
    >
      <h2 class="text-xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
        Void Lease
      </h2>
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        Are you sure you want to void this lease? You can optionally provide a reason.
      </p>

      <div class="mb-6">
        <label for="voidReason" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
          Reason (Optional)
        </label>
        <textarea
          id="voidReason"
          ref="reasonTextareaRef"
          v-model="voidReason"
          placeholder="Enter reason for voiding this lease..."
          rows="3"
          class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500"
        ></textarea>
      </div>

      <div class="flex gap-4 justify-end">
        <button
          type="button"
          class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-6 py-2 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          @click="handleConfirm"
        >
          Void Lease
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{
  confirm: [reason?: string];
  cancel: [];
}>();

const modalRef = ref<HTMLElement | null>(null);
const reasonTextareaRef = ref<HTMLTextAreaElement | null>(null);
const voidReason = ref('');

const handleConfirm = () => {
  emit('confirm', voidReason.value || undefined);
};

const handleCancel = () => {
  emit('cancel');
};

const handleTabKey = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;

  const focusableElements = modalRef.value?.querySelectorAll(
    'button, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusableElements || focusableElements.length === 0) return;

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (event.shiftKey) {
    // Shift+Tab: Moving backwards
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab: Moving forwards
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

onMounted(() => {
  // Auto-focus on textarea
  if (reasonTextareaRef.value) {
    reasonTextareaRef.value.focus();
  }

  // Add tab key handler for focus trap
  document.addEventListener('keydown', handleTabKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleTabKey);
});
</script>
