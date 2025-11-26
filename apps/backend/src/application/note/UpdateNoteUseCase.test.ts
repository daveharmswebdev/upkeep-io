import { UpdateNoteUseCase } from './UpdateNoteUseCase';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import type { Note } from '@domain/entities';

describe('UpdateNoteUseCase', () => {
  let useCase: UpdateNoteUseCase;
  let mockNoteRepository: jest.Mocked<INoteRepository>;

  const userId = 'user-123';
  const noteId = 'note-456';

  const mockNote: Note = {
    id: noteId,
    userId,
    entityType: 'property',
    entityId: 'property-123',
    content: 'Original content',
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

    useCase = new UpdateNoteUseCase(mockNoteRepository);
  });

  it('should update note content', async () => {
    const updatedContent = 'Updated content with new information';

    const updatedNote: Note = {
      ...mockNote,
      content: updatedContent,
      updatedAt: new Date('2024-01-02'),
    };

    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);
    mockNoteRepository.update.mockResolvedValueOnce(updatedNote);

    const result = await useCase.execute(noteId, userId, { content: updatedContent });

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.update).toHaveBeenCalledWith(noteId, { content: updatedContent });
    expect(result.content).toBe(updatedContent);
    expect(result.id).toBe(noteId);
  });

  it('should throw NotFoundError if note does not exist', async () => {
    mockNoteRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute(noteId, userId, { content: 'New content' })
    ).rejects.toThrow(new NotFoundError('Note', noteId));

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if note does not belong to user', async () => {
    const wrongUserId = 'wrong-user-789';
    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);

    await expect(
      useCase.execute(noteId, wrongUserId, { content: 'New content' })
    ).rejects.toThrow(new ValidationError('Note does not belong to this user'));

    expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    expect(mockNoteRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if content is empty', async () => {
    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);

    await expect(
      useCase.execute(noteId, userId, { content: '' })
    ).rejects.toThrow(ValidationError);

    expect(mockNoteRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if content exceeds 10000 characters', async () => {
    mockNoteRepository.findById.mockResolvedValueOnce(mockNote);

    await expect(
      useCase.execute(noteId, userId, { content: 'a'.repeat(10001) })
    ).rejects.toThrow(ValidationError);

    expect(mockNoteRepository.update).not.toHaveBeenCalled();
  });

  it('should not update soft-deleted notes', async () => {
    const deletedNote: Note = {
      ...mockNote,
      deletedAt: new Date('2024-01-01'),
    };

    mockNoteRepository.findById.mockResolvedValueOnce(deletedNote);

    await expect(
      useCase.execute(noteId, userId, { content: 'New content' })
    ).rejects.toThrow(new NotFoundError('Note', noteId));

    expect(mockNoteRepository.update).not.toHaveBeenCalled();
  });
});
