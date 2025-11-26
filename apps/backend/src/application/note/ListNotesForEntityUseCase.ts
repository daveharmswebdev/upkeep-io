import { injectable, inject } from 'inversify';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { ValidationError } from '@domain/errors';
import { Note, NoteEntityType } from '@domain/entities';
import { z } from 'zod';

const listNotesQuerySchema = z.object({
  entityType: z.enum(['property', 'lease', 'lease_pet', 'person'], {
    errorMap: () => ({ message: 'Entity type must be one of: property, lease, lease_pet, person' }),
  }),
  entityId: z.string().uuid('Entity ID must be a valid UUID'),
});

@injectable()
export class ListNotesForEntityUseCase {
  constructor(
    @inject('INoteRepository') private noteRepository: INoteRepository
  ) {}

  async execute(entityType: NoteEntityType, entityId: string): Promise<Note[]> {
    // Validate input
    const validation = listNotesQuerySchema.safeParse({ entityType, entityId });
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Get notes for entity (repository filters out soft-deleted notes)
    const notes = await this.noteRepository.findByEntity(entityType, entityId);

    return notes;
  }
}
