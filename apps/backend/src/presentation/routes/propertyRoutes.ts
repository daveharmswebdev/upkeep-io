import { Router } from 'express';
import { Container } from 'inversify';
import { PropertyController } from '../controllers';
// import { TenantController } from '../controllers/TenantController';
import { createAuthMiddleware } from '../middleware';

export const createPropertyRoutes = (container: Container): Router => {
  const router = Router();
  const propertyController = container.get(PropertyController);
  // const tenantController = container.get(TenantController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  router.post('/', (req, res, next) => propertyController.create(req, res, next));
  router.get('/', (req, res, next) => propertyController.list(req, res, next));
  router.get('/:id', (req, res, next) => propertyController.getById(req, res, next));
  router.put('/:id', (req, res, next) => propertyController.update(req, res, next));
  router.delete('/:id', (req, res, next) => propertyController.delete(req, res, next));

  // Nested route for listing tenants by property - commented out (Tenant replaced with Lease)
  // router.get('/:propertyId/tenants', (req, res, next) => tenantController.listByProperty(req, res, next));

  return router;
};
