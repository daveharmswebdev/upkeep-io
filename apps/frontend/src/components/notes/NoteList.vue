<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100">
        Notes
        <span v-if="sortedNotes.length > 0" class="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
          ({{ sortedNotes.length }})
        </span>
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="noteStore.loading && !sortedNotes.length" class="text-center py-6 text-gray-600 dark:text-gray-400">
      Loading notes...
    </div>

    <!-- Error State -->
    <div v-else-if="noteStore.error" class="bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 p-4 rounded dark:border dark:border-primary-700">
      {{ noteStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="sortedNotes.length === 0" class="text-center py-6">
      <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400 mb-4">No notes yet</p>
    </div>

    <!-- Notes List -->
    <div v-else class="space-y-3">
      <NoteItem
        v-for="note in sortedNotes"
        :key="note.id"
        :note="note"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Add Note Form -->
    <div class="border-t dark:border-gray-700 pt-4">
      <NoteForm @submit="handleCreate" />
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirm-label="Delete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import type { NoteEntityType } from '@domain/entities';
import { useNoteStore } from '@/stores/note';
import { extractErrorMessage } from '@/utils/errorHandlers';
import NoteItem from './NoteItem.vue';
import NoteForm from './NoteForm.vue';
import ConfirmModal from '../ConfirmModal.vue';

interface Props {
  entityType: NoteEntityType;
  entityId: string;
}

const props = defineProps<Props>();

const noteStore = useNoteStore();
const toast = useToast();

const showDeleteModal = ref(false);
const noteToDelete = ref<string | null>(null);

// Sort notes by creation date (newest first)
const sortedNotes = computed(() => {
  return [...noteStore.notes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// Fetch notes on mount
onMounted(async () => {
  try {
    await noteStore.fetchNotesForEntity(props.entityType, props.entityId);
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to load notes');
    toast.error(errorMsg);
  }
});

// Handle create note
const handleCreate = async (content: string) => {
  try {
    await noteStore.createNote({
      entityType: props.entityType,
      entityId: props.entityId,
      content,
    });
    toast.success('Note added successfully');
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to add note');
    toast.error(errorMsg);
  }
};

// Handle edit note
const handleEdit = async (id: string, content: string) => {
  try {
    await noteStore.updateNote(id, { content });
    toast.success('Note updated successfully');
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to update note');
    toast.error(errorMsg);
  }
};

// Handle delete note
const handleDelete = (id: string) => {
  noteToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!noteToDelete.value) return;

  try {
    await noteStore.deleteNote(noteToDelete.value);
    toast.success('Note deleted successfully');
  } catch (err: any) {
    const errorMsg = extractErrorMessage(err, 'Failed to delete note');
    toast.error(errorMsg);
  } finally {
    showDeleteModal.value = false;
    noteToDelete.value = null;
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  noteToDelete.value = null;
};
</script>
