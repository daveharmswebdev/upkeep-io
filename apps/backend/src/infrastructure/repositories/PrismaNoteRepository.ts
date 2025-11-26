import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { Note, CreateNoteData, UpdateNoteData, NoteEntityType } from '@domain/entities';

@injectable()
export class PrismaNoteRepository implements INoteRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<Note | null> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) return null;

    return {
      ...note,
      entityType: note.entityType as NoteEntityType,
      deletedAt: note.deletedAt ?? undefined,
    };
  }

  async findByEntity(entityType: NoteEntityType, entityId: string): Promise<Note[]> {
    const notes = await this.prisma.note.findMany({
      where: {
        entityType,
        entityId,
        deletedAt: null, // Exclude soft-deleted notes
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => ({
      ...note,
      entityType: note.entityType as NoteEntityType,
      deletedAt: note.deletedAt ?? undefined,
    }));
  }

  async create(data: CreateNoteData): Promise<Note> {
    const note = await this.prisma.note.create({
      data: {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        content: data.content,
      },
    });

    return {
      ...note,
      entityType: note.entityType as NoteEntityType,
      deletedAt: note.deletedAt ?? undefined,
    };
  }

  async update(id: string, data: UpdateNoteData): Promise<Note> {
    const note = await this.prisma.note.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
    });

    return {
      ...note,
      entityType: note.entityType as NoteEntityType,
      deletedAt: note.deletedAt ?? undefined,
    };
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
