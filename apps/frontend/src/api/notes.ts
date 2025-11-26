import type { Note, NoteEntityType } from '@domain/entities';
import type { CreateNoteInput, UpdateNoteInput } from '@validators/note';
import apiClient from './client';

export const notesApi = {
  /**
   * Fetch all notes for a specific entity
   */
  fetchNotesForEntity(entityType: NoteEntityType, entityId: string): Promise<Note[]> {
    return apiClient
      .get<Note[]>('/notes', {
        params: { entityType, entityId },
      })
      .then((response) => response.data);
  },

  /**
   * Create a new note
   */
  createNote(data: CreateNoteInput): Promise<Note> {
    return apiClient.post<Note>('/notes', data).then((response) => response.data);
  },

  /**
   * Update an existing note
   */
  updateNote(id: string, data: UpdateNoteInput): Promise<Note> {
    return apiClient.put<Note>(`/notes/${id}`, data).then((response) => response.data);
  },

  /**
   * Delete (soft delete) a note
   */
  deleteNote(id: string): Promise<void> {
    return apiClient.delete(`/notes/${id}`).then(() => undefined);
  },
};
