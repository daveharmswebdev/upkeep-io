import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';
import { ITokenGenerator } from '../../domain/services';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createAuthMiddleware = (container: Container) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const tokenGenerator = container.get<ITokenGenerator>('ITokenGenerator');
      const payload = tokenGenerator.verify(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};
