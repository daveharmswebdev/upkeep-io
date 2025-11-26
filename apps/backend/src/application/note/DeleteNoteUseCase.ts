import { injectable, inject } from 'inversify';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { NotFoundError, ValidationError } from '@domain/errors';

@injectable()
export class DeleteNoteUseCase {
  constructor(
    @inject('INoteRepository') private noteRepository: INoteRepository
  ) {}

  async execute(noteId: string, userId: string): Promise<void> {
    // Find note
    const note = await this.noteRepository.findById(noteId);
    if (!note || note.deletedAt) {
      throw new NotFoundError('Note', noteId);
    }

    // Verify ownership
    if (note.userId !== userId) {
      throw new ValidationError('Note does not belong to this user');
    }

    // Soft delete note
    await this.noteRepository.softDelete(noteId);
  }
}
