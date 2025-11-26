import { injectable, inject } from 'inversify';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { ValidationError } from '@domain/errors';
import { createNoteSchema } from '@validators/note';
import { Note, CreateNoteData } from '@domain/entities';

@injectable()
export class CreateNoteUseCase {
  constructor(
    @inject('INoteRepository') private noteRepository: INoteRepository
  ) {}

  async execute(input: CreateNoteData): Promise<Note> {
    // Validate input
    const validation = createNoteSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Create note
    const note = await this.noteRepository.create({
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      content: input.content,
    });

    return note;
  }
}
