export type NoteEntityType = 'property' | 'lease' | 'lease_pet' | 'person';

export interface Note {
  id: string;
  userId: string;
  entityType: NoteEntityType;
  entityId: string;
  content: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteData {
  userId: string;
  entityType: NoteEntityType;
  entityId: string;
  content: string;
}

export interface UpdateNoteData {
  content: string;
}
