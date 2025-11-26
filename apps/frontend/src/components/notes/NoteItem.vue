<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
    <!-- Note Content -->
    <div v-if="!isEditing" class="text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
      {{ note.content }}
    </div>

    <!-- Edit Mode -->
    <div v-else>
      <textarea
        v-model="editContent"
        rows="4"
        class="w-full px-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500"
        placeholder="Enter note content..."
      ></textarea>
    </div>

    <!-- Note Metadata -->
    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ formatDateTime(note.createdAt) }}</span>
        <span v-if="wasUpdated" class="italic">(edited)</span>
      </div>

      <!-- Action Buttons -->
      <div v-if="!isEditing" class="flex items-center gap-2">
        <button
          @click="handleEdit"
          class="text-secondary-1-400 hover:text-secondary-1-500 dark:text-secondary-1-300 dark:hover:text-secondary-1-400 transition-colors"
          title="Edit note"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="handleDelete"
          class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors"
          title="Delete note"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Edit Action Buttons -->
      <div v-else class="flex items-center gap-2">
        <button
          @click="handleCancelEdit"
          class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSaveEdit"
          :disabled="!editContent.trim() || editContent === note.content"
          class="px-3 py-1 text-sm bg-complement-300 text-white rounded hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Note } from '@domain/entities';
import { formatDateTime } from '@/utils/formatters';

interface Props {
  note: Note;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [id: string, content: string];
  delete: [id: string];
}>();

const isEditing = ref(false);
const editContent = ref('');

const wasUpdated = computed(() => {
  const created = new Date(props.note.createdAt).getTime();
  const updated = new Date(props.note.updatedAt).getTime();
  return updated - created > 1000; // More than 1 second difference
});

const handleEdit = () => {
  isEditing.value = true;
  editContent.value = props.note.content;
};

const handleCancelEdit = () => {
  isEditing.value = false;
  editContent.value = '';
};

const handleSaveEdit = () => {
  if (editContent.value.trim() && editContent.value !== props.note.content) {
    emit('edit', props.note.id, editContent.value.trim());
    isEditing.value = false;
  }
};

const handleDelete = () => {
  emit('delete', props.note.id);
};
</script>
