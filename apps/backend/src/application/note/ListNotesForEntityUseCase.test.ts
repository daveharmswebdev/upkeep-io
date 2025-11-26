import { ListNotesForEntityUseCase } from './ListNotesForEntityUseCase';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { ValidationError } from '@domain/errors';
import type { Note } from '@domain/entities';

describe('ListNotesForEntityUseCase', () => {
  let useCase: ListNotesForEntityUseCase;
  let mockNoteRepository: jest.Mocked<INoteRepository>;

  const userId = 'user-123';

  beforeEach(() => {
    mockNoteRepository = {
      findById: jest.fn(),
      findByEntity: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    useCase = new ListNotesForEntityUseCase(mockNoteRepository);
  });

  it('should list all notes for a property', async () => {
    const propertyId = '550e8400-e29b-41d4-a716-446655440000';
    const mockNotes: Note[] = [
      {
        id: 'note-1',
        userId,
        entityType: 'property',
        entityId: propertyId,
        content: 'First note about property',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'note-2',
        userId,
        entityType: 'property',
        entityId: propertyId,
        content: 'Second note about property',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    mockNoteRepository.findByEntity.mockResolvedValueOnce(mockNotes);

    const result = await useCase.execute('property', propertyId);

    expect(mockNoteRepository.findByEntity).toHaveBeenCalledWith('property', propertyId);
    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('First note about property');
    expect(result[1].content).toBe('Second note about property');
  });

  it('should list all notes for a lease', async () => {
    const leaseId = '660e8400-e29b-41d4-a716-446655440001';
    const mockNotes: Note[] = [
      {
        id: 'note-3',
        userId,
        entityType: 'lease',
        entityId: leaseId,
        content: 'Lease note',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ];

    mockNoteRepository.findByEntity.mockResolvedValueOnce(mockNotes);

    const result = await useCase.execute('lease', leaseId);

    expect(mockNoteRepository.findByEntity).toHaveBeenCalledWith('lease', leaseId);
    expect(result).toHaveLength(1);
    expect(result[0].entityType).toBe('lease');
  });

  it('should list all notes for a lease pet', async () => {
    const petId = '770e8400-e29b-41d4-a716-446655440002';
    const mockNotes: Note[] = [
      {
        id: 'note-4',
        userId,
        entityType: 'lease_pet',
        entityId: petId,
        content: 'Pet behavior note',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
    ];

    mockNoteRepository.findByEntity.mockResolvedValueOnce(mockNotes);

    const result = await useCase.execute('lease_pet', petId);

    expect(result).toHaveLength(1);
    expect(result[0].entityType).toBe('lease_pet');
  });

  it('should list all notes for a person', async () => {
    const personId = '880e8400-e29b-41d4-a716-446655440003';
    const mockNotes: Note[] = [
      {
        id: 'note-5',
        userId,
        entityType: 'person',
        entityId: personId,
        content: 'Contact preferences',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
    ];

    mockNoteRepository.findByEntity.mockResolvedValueOnce(mockNotes);

    const result = await useCase.execute('person', personId);

    expect(result).toHaveLength(1);
    expect(result[0].entityType).toBe('person');
  });

  it('should return empty array when no notes exist for entity', async () => {
    mockNoteRepository.findByEntity.mockResolvedValueOnce([]);

    const result = await useCase.execute('property', '990e8400-e29b-41d4-a716-446655440999');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should throw ValidationError if entityType is invalid', async () => {
    await expect(
      useCase.execute('invalid_type' as any, 'entity-123')
    ).rejects.toThrow(ValidationError);

    expect(mockNoteRepository.findByEntity).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if entityId is not a valid UUID', async () => {
    await expect(
      useCase.execute('property', 'not-a-uuid')
    ).rejects.toThrow(ValidationError);

    expect(mockNoteRepository.findByEntity).not.toHaveBeenCalled();
  });

  it('should exclude soft-deleted notes from results', async () => {
    const propertyId = '550e8400-e29b-41d4-a716-446655440000';
    const mockNotes: Note[] = [
      {
        id: 'note-1',
        userId,
        entityType: 'property',
        entityId: propertyId,
        content: 'Active note',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    mockNoteRepository.findByEntity.mockResolvedValueOnce(mockNotes);

    const result = await useCase.execute('property', propertyId);

    expect(result).toHaveLength(1);
    expect(result.every(note => !note.deletedAt)).toBe(true);
  });
});
