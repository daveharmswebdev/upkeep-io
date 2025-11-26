import { injectable, inject } from 'inversify';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import { updateNoteSchema } from '@validators/note';
import { Note, UpdateNoteData } from '@domain/entities';

@injectable()
export class UpdateNoteUseCase {
  constructor(
    @inject('INoteRepository') private noteRepository: INoteRepository
  ) {}

  async execute(noteId: string, userId: string, data: UpdateNoteData): Promise<Note> {
    // Validate input
    const validation = updateNoteSchema.safeParse(data);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Find note
    const note = await this.noteRepository.findById(noteId);
    if (!note || note.deletedAt) {
      throw new NotFoundError('Note', noteId);
    }

    // Verify ownership
    if (note.userId !== userId) {
      throw new ValidationError('Note does not belong to this user');
    }

    // Update note
    const updatedNote = await this.noteRepository.update(noteId, data);

    return updatedNote;
  }
}
