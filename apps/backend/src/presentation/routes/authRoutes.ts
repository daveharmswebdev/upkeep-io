import { Router } from 'express';
import { Container } from 'inversify';
import { AuthController } from '../controllers';

export const createAuthRoutes = (container: Container): Router => {
  const router = Router();
  const authController = container.get(AuthController);

  router.post('/signup', (req, res, next) => authController.signup(req, res, next));
  router.post('/login', (req, res, next) => authController.login(req, res, next));

  return router;
};
