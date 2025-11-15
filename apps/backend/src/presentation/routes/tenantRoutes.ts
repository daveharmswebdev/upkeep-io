import { Router } from 'express';
import { Container } from 'inversify';
import { TenantController } from '../controllers/TenantController';
import { createAuthMiddleware } from '../middleware';

export const createTenantRoutes = (container: Container): Router => {
  const router = Router();
  const tenantController = container.get(TenantController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  router.post('/', (req, res, next) => tenantController.create(req, res, next));
  router.get('/', (req, res, next) => tenantController.list(req, res, next));
  router.get('/:id', (req, res, next) => tenantController.getById(req, res, next));
  router.put('/:id', (req, res, next) => tenantController.update(req, res, next));
  router.delete('/:id', (req, res, next) => tenantController.delete(req, res, next));

  return router;
};
