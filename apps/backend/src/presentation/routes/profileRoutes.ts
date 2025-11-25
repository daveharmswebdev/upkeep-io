import { Router } from 'express';
import { Container } from 'inversify';
import { ProfileController } from '../controllers';
import { createAuthMiddleware } from '../middleware';

export const createProfileRoutes = (container: Container): Router => {
  const router = Router();
  const profileController = container.get(ProfileController);
  const authMiddleware = createAuthMiddleware(container);

  router.use(authMiddleware);

  router.get('/', (req, res, next) => profileController.get(req, res, next));
  router.put('/', (req, res, next) => profileController.update(req, res, next));

  return router;
};
