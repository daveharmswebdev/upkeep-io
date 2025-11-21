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
      class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
    >
      <h2 class="text-xl font-heading font-bold text-gray-800 mb-4">
        {{ title }}
      </h2>
      <p class="text-gray-700 mb-6">
        {{ message }}
      </p>
      <div class="flex gap-4 justify-end">
        <button
          ref="cancelButtonRef"
          type="button"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          ref="deleteButtonRef"
          type="button"
          class="px-6 py-2 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          @click="handleConfirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineProps<{
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const modalRef = ref<HTMLElement | null>(null);
const cancelButtonRef = ref<HTMLButtonElement | null>(null);
const deleteButtonRef = ref<HTMLButtonElement | null>(null);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleTabKey = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;

  const focusableElements = [cancelButtonRef.value, deleteButtonRef.value].filter(Boolean);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) return;

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
  // Auto-focus on first button
  if (cancelButtonRef.value) {
    cancelButtonRef.value.focus();
  }

  // Add tab key handler for focus trap
  document.addEventListener('keydown', handleTabKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleTabKey);
});
</script>
