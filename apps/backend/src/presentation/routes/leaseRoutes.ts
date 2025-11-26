import { Router } from 'express';
import { Container } from 'inversify';
import { LeaseController } from '../controllers/LeaseController';
import { createAuthMiddleware } from '../middleware';

export const createLeaseRoutes = (container: Container): Router => {
  const router = Router();
  const leaseController = container.get(LeaseController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  // Core CRUD operations
  router.post('/', (req, res) => leaseController.create(req, res));
  router.get('/', (req, res) => leaseController.list(req, res));
  router.get('/:id', (req, res) => leaseController.getById(req, res));
  router.put('/:id', (req, res) => leaseController.update(req, res));
  router.delete('/:id', (req, res) => leaseController.delete(req, res));

  // Get leases by property (must be before /:id to avoid route conflict)
  router.get('/property/:propertyId', (req, res) => leaseController.listByProperty(req, res));

  // Lessee management
  router.post('/:id/lessees', (req, res) => leaseController.addLessee(req, res));
  router.delete('/:id/lessees/:personId', (req, res) => leaseController.removeLessee(req, res));

  // Occupant management
  router.post('/:id/occupants', (req, res) => leaseController.addOccupant(req, res));
  router.delete('/:id/occupants/:occupantId', (req, res) => leaseController.removeOccupant(req, res));

  // Pet management
  router.post('/:id/pets', (req, res) => leaseController.addPet(req, res));
  router.delete('/:id/pets/:petId', (req, res) => leaseController.removePet(req, res));

  return router;
};
