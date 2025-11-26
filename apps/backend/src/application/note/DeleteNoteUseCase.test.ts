import { DeleteNoteUseCase } from './DeleteNoteUseCase';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import type { Note } from '@domain/entities';

describe('DeleteNoteUseCase', () => {
  let useCase: DeleteNoteUseCase;
  let mockNoteRepository: jest.Mocked<INoteRepository>;

  const userId = 'user-123';
  const noteId = 'note-456';

  const mockNote: Note = {
    id: noteId,
    userId,
    entityType: 'lease',
    entityId: 'lease-123',
    content: 'This note will be deleted',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockNoteRepository = {
      findById: jest.fn(),
      findByEntity: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    useCase = new DeleteNoteUseCase(mockNoteRepository);
  });

  it('should soft delete a note', async () => {
    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);
    mockNoteRepository.softDelete.mockResolvedValueOnce(undefined);

    await useCase.execute(noteId, userId);

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.softDelete).toHaveBeenCalledWith(noteId);
  });

  it('should throw NotFoundError if note does not exist', async () => {
    mockNoteRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(noteId, userId)).rejects.toThrow(
      new NotFoundError('Note', noteId)
    );

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if note does not belong to user', async () => {
    const wrongUserId = 'wrong-user-789';
    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);

    await expect(useCase.execute(noteId, wrongUserId)).rejects.toThrow(
      new ValidationError('Note does not belong to this user')
    );

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if note is already soft-deleted', async () => {
    const deletedNote: Note = {
      ...mockNote,
      deletedAt: new Date('2024-01-01'),
    };

    mockNoteRepository.findById.mockResolvedValueOnce(deletedNote);

    await expect(useCase.execute(noteId, userId)).rejects.toThrow(
      new NotFoundError('Note', noteId)
    );

    expect(mockNoteRepository.softDelete).not.toHaveBeenCalled();
  });
});
