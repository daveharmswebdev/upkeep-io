import { Note, CreateNoteData, UpdateNoteData, NoteEntityType } from '@domain/entities';

export interface INoteRepository {
  findById(id: string): Promise<Note | null>;
  findByEntity(entityType: NoteEntityType, entityId: string): Promise<Note[]>;
  create(data: CreateNoteData): Promise<Note>;
  update(id: string, data: UpdateNoteData): Promise<Note>;
  softDelete(id: string): Promise<void>;
}
