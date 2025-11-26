import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Note, NoteEntityType } from '@domain/entities';
import type { CreateNoteInput, UpdateNoteInput } from '@validators/note';
import { notesApi } from '@/api/notes';
import { extractErrorMessage } from '@/utils/errorHandlers';

/**
 * Generate a unique key for an entity's notes
 */
function getEntityKey(entityType: NoteEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

export const useNoteStore = defineStore('note', () => {
  // Store notes keyed by entity (e.g., "property:123", "lease:456")
  const notesByEntity = ref<Record<string, Note[]>>({});
  // Track loading state per entity
  const loadingByEntity = ref<Record<string, boolean>>({});
  // Track errors per entity
  const errorByEntity = ref<Record<string, string>>({});

  /**
   * Get notes for a specific entity
   */
  function getNotesForEntity(entityType: NoteEntityType, entityId: string): Note[] {
    const key = getEntityKey(entityType, entityId);
    return notesByEntity.value[key] || [];
  }

  /**
   * Check if loading for a specific entity
   */
  function isLoadingForEntity(entityType: NoteEntityType, entityId: string): boolean {
    const key = getEntityKey(entityType, entityId);
    return loadingByEntity.value[key] || false;
  }

  /**
   * Get error for a specific entity
   */
  function getErrorForEntity(entityType: NoteEntityType, entityId: string): string {
    const key = getEntityKey(entityType, entityId);
    return errorByEntity.value[key] || '';
  }

  /**
   * Fetch all notes for a specific entity
   */
  async function fetchNotesForEntity(entityType: NoteEntityType, entityId: string) {
    const key = getEntityKey(entityType, entityId);
    loadingByEntity.value[key] = true;
    errorByEntity.value[key] = '';
    try {
      const fetchedNotes = await notesApi.fetchNotesForEntity(entityType, entityId);
      notesByEntity.value[key] = fetchedNotes;
      return fetchedNotes;
    } catch (err: any) {
      errorByEntity.value[key] = extractErrorMessage(err, 'Failed to fetch notes');
      throw err;
    } finally {
      loadingByEntity.value[key] = false;
    }
  }

  /**
   * Create a new note
   */
  async function createNote(data: CreateNoteInput) {
    const key = getEntityKey(data.entityType, data.entityId);
    loadingByEntity.value[key] = true;
    errorByEntity.value[key] = '';
    try {
      const newNote = await notesApi.createNote(data);
      // Initialize array if not exists
      if (!notesByEntity.value[key]) {
        notesByEntity.value[key] = [];
      }
      // Add to beginning of list (most recent first)
      notesByEntity.value[key].unshift(newNote);
      return newNote;
    } catch (err: any) {
      errorByEntity.value[key] = extractErrorMessage(err, 'Failed to create note');
      throw err;
    } finally {
      loadingByEntity.value[key] = false;
    }
  }

  /**
   * Update an existing note
   */
  async function updateNote(entityType: NoteEntityType, entityId: string, id: string, data: UpdateNoteInput) {
    const key = getEntityKey(entityType, entityId);
    loadingByEntity.value[key] = true;
    errorByEntity.value[key] = '';
    try {
      const updatedNote = await notesApi.updateNote(id, data);
      const notes = notesByEntity.value[key] || [];
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notesByEntity.value[key][index] = updatedNote;
      }
      return updatedNote;
    } catch (err: any) {
      errorByEntity.value[key] = extractErrorMessage(err, 'Failed to update note');
      throw err;
    } finally {
      loadingByEntity.value[key] = false;
    }
  }

  /**
   * Delete a note
   */
  async function deleteNote(entityType: NoteEntityType, entityId: string, id: string) {
    const key = getEntityKey(entityType, entityId);
    loadingByEntity.value[key] = true;
    errorByEntity.value[key] = '';
    try {
      await notesApi.deleteNote(id);
      notesByEntity.value[key] = (notesByEntity.value[key] || []).filter((n) => n.id !== id);
    } catch (err: any) {
      errorByEntity.value[key] = extractErrorMessage(err, 'Failed to delete note');
      throw err;
    } finally {
      loadingByEntity.value[key] = false;
    }
  }

  /**
   * Clear notes for a specific entity
   */
  function clearNotesForEntity(entityType: NoteEntityType, entityId: string) {
    const key = getEntityKey(entityType, entityId);
    delete notesByEntity.value[key];
    delete errorByEntity.value[key];
  }

  /**
   * Clear all notes from store (useful when navigating away)
   */
  function clearAllNotes() {
    notesByEntity.value = {};
    errorByEntity.value = {};
    loadingByEntity.value = {};
  }

  return {
    notesByEntity,
    loadingByEntity,
    errorByEntity,
    getNotesForEntity,
    isLoadingForEntity,
    getErrorForEntity,
    fetchNotesForEntity,
    createNote,
    updateNote,
    deleteNote,
    clearNotesForEntity,
    clearAllNotes,
  };
});
