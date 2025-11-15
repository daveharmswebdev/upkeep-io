import { Router } from 'express';
import { Container } from 'inversify';
import { PropertyController } from '../controllers';
import { createAuthMiddleware } from '../middleware';

export const createPropertyRoutes = (container: Container): Router => {
  const router = Router();
  const propertyController = container.get(PropertyController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  router.post('/', (req, res, next) => propertyController.create(req, res, next));
  router.get('/', (req, res, next) => propertyController.list(req, res, next));
  router.get('/:id', (req, res, next) => propertyController.getById(req, res, next));
  router.put('/:id', (req, res, next) => propertyController.update(req, res, next));
  router.delete('/:id', (req, res, next) => propertyController.delete(req, res, next));

  return router;
};
