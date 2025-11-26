import { CreateNoteUseCase } from './CreateNoteUseCase';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { ValidationError } from '@domain/errors';
import type { Note } from '@domain/entities';

describe('CreateNoteUseCase', () => {
  let useCase: CreateNoteUseCase;
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

    useCase = new CreateNoteUseCase(mockNoteRepository);
  });

  it('should create a note for a property', async () => {
    const input = {
      userId,
      entityType: 'property' as const,
      entityId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'This property needs new paint',
    };

    const mockNote: Note = {
      id: 'note-1',
      userId,
      entityType: 'property',
      entityId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'This property needs new paint',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNoteRepository.create.mockResolvedValueOnce(mockNote);

    const result = await useCase.execute(input);

    expect(mockNoteRepository.create).toHaveBeenCalledWith({
      userId,
      entityType: 'property',
      entityId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'This property needs new paint',
    });
    expect(result).toEqual(mockNote);
    expect(result.entityType).toBe('property');
  });

  it('should create a note for a lease', async () => {
    const input = {
      userId,
      entityType: 'lease' as const,
      entityId: '660e8400-e29b-41d4-a716-446655440001',
      content: 'Tenant requested maintenance',
    };

    const mockNote: Note = {
      id: 'note-2',
      userId,
      entityType: 'lease',
      entityId: '660e8400-e29b-41d4-a716-446655440001',
      content: 'Tenant requested maintenance',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNoteRepository.create.mockResolvedValueOnce(mockNote);

    const result = await useCase.execute(input);

    expect(mockNoteRepository.create).toHaveBeenCalledWith(input);
    expect(result.entityType).toBe('lease');
    expect(result.content).toBe('Tenant requested maintenance');
  });

  it('should create a note for a lease pet', async () => {
    const input = {
      userId,
      entityType: 'lease_pet' as const,
      entityId: '770e8400-e29b-41d4-a716-446655440002',
      content: 'Pet requires special care',
    };

    const mockNote: Note = {
      id: 'note-3',
      userId,
      entityType: 'lease_pet',
      entityId: '770e8400-e29b-41d4-a716-446655440002',
      content: 'Pet requires special care',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNoteRepository.create.mockResolvedValueOnce(mockNote);

    const result = await useCase.execute(input);

    expect(result.entityType).toBe('lease_pet');
    expect(result.content).toBe('Pet requires special care');
  });

  it('should create a note for a person', async () => {
    const input = {
      userId,
      entityType: 'person' as const,
      entityId: '880e8400-e29b-41d4-a716-446655440003',
      content: 'Preferred contact method: email',
    };

    const mockNote: Note = {
      id: 'note-4',
      userId,
      entityType: 'person',
      entityId: '880e8400-e29b-41d4-a716-446655440003',
      content: 'Preferred contact method: email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNoteRepository.create.mockResolvedValueOnce(mockNote);

    const result = await useCase.execute(input);

    expect(result.entityType).toBe('person');
    expect(result.content).toBe('Preferred contact method: email');
  });

  it('should throw ValidationError if entityType is invalid', async () => {
    const input = {
      userId,
      entityType: 'invalid_type' as any,
      entityId: 'entity-123',
      content: 'Some note',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockNoteRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if entityId is not a valid UUID', async () => {
    const input = {
      userId,
      entityType: 'property' as const,
      entityId: 'not-a-valid-uuid',
      content: 'Some note',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockNoteRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if content is empty', async () => {
    const input = {
      userId,
      entityType: 'property' as const,
      entityId: 'property-123',
      content: '',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockNoteRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if content exceeds 10000 characters', async () => {
    const input = {
      userId,
      entityType: 'property' as const,
      entityId: 'property-123',
      content: 'a'.repeat(10001),
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockNoteRepository.create).not.toHaveBeenCalled();
  });
});
