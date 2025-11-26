import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Note, NoteEntityType } from '@domain/entities';
import type { CreateNoteInput, UpdateNoteInput } from '@validators/note';
import { notesApi } from '@/api/notes';
import { extractErrorMessage } from '@/utils/errorHandlers';

export const useNoteStore = defineStore('note', () => {
  const notes = ref<Note[]>([]);
  const loading = ref(false);
  const error = ref('');

  /**
   * Fetch all notes for a specific entity
   */
  async function fetchNotesForEntity(entityType: NoteEntityType, entityId: string) {
    loading.value = true;
    error.value = '';
    try {
      const fetchedNotes = await notesApi.fetchNotesForEntity(entityType, entityId);
      notes.value = fetchedNotes;
      return fetchedNotes;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch notes');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new note
   */
  async function createNote(data: CreateNoteInput) {
    loading.value = true;
    error.value = '';
    try {
      const newNote = await notesApi.createNote(data);
      // Add to beginning of list (most recent first)
      notes.value.unshift(newNote);
      return newNote;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to create note');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update an existing note
   */
  async function updateNote(id: string, data: UpdateNoteInput) {
    loading.value = true;
    error.value = '';
    try {
      const updatedNote = await notesApi.updateNote(id, data);
      const index = notes.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      return updatedNote;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to update note');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a note
   */
  async function deleteNote(id: string) {
    loading.value = true;
    error.value = '';
    try {
      await notesApi.deleteNote(id);
      notes.value = notes.value.filter((n) => n.id !== id);
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to delete note');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear notes from store (useful when navigating away)
   */
  function clearNotes() {
    notes.value = [];
    error.value = '';
  }

  return {
    notes,
    loading,
    error,
    fetchNotesForEntity,
    createNote,
    updateNote,
    deleteNote,
    clearNotes,
  };
});
