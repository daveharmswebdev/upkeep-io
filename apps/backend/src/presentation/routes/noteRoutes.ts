import { Router } from 'express';
import { Container } from 'inversify';
import { NoteController } from '../controllers/NoteController';
import { createAuthMiddleware } from '../middleware';

export const createNoteRoutes = (container: Container): Router => {
  const router = Router();
  const noteController = container.get(NoteController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  router.post('/', (req, res, next) => noteController.create(req, res, next));
  router.get('/', (req, res, next) => noteController.listForEntity(req, res, next));
  router.put('/:id', (req, res, next) => noteController.update(req, res, next));
  router.delete('/:id', (req, res, next) => noteController.delete(req, res, next));

  return router;
};
