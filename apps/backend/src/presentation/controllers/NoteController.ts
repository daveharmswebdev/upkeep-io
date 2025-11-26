import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import {
  CreateNoteUseCase,
  UpdateNoteUseCase,
  DeleteNoteUseCase,
  ListNotesForEntityUseCase,
} from '../../application/note';
import { AuthRequest } from '../middleware';
import { NoteEntityType } from '@domain/entities';

@injectable()
export class NoteController {
  constructor(
    @inject(CreateNoteUseCase) private createNoteUseCase: CreateNoteUseCase,
    @inject(UpdateNoteUseCase) private updateNoteUseCase: UpdateNoteUseCase,
    @inject(DeleteNoteUseCase) private deleteNoteUseCase: DeleteNoteUseCase,
    @inject(ListNotesForEntityUseCase) private listNotesForEntityUseCase: ListNotesForEntityUseCase
  ) {}

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { entityType, entityId, content } = req.body;

      const note = await this.createNoteUseCase.execute({
        userId: req.user.userId,
        entityType,
        entityId,
        content,
      });

      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { content } = req.body;

      const note = await this.updateNoteUseCase.execute(
        req.params.id,
        req.user.userId,
        { content }
      );

      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.deleteNoteUseCase.execute(req.params.id, req.user.userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async listForEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'entityType and entityId query parameters are required' });
        return;
      }

      const notes = await this.listNotesForEntityUseCase.execute(
        entityType as NoteEntityType,
        entityId as string
      );

      res.status(200).json(notes);
    } catch (error) {
      next(error);
    }
  }
}
