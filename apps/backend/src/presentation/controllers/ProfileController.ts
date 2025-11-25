import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { GetProfileUseCase, UpdateProfileUseCase } from '../../application/profile';
import { AuthRequest } from '../middleware';

@injectable()
export class ProfileController {
  constructor(
    @inject(GetProfileUseCase) private getProfileUseCase: GetProfileUseCase,
    @inject(UpdateProfileUseCase) private updateProfileUseCase: UpdateProfileUseCase
  ) {}

  async get(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.getProfileUseCase.execute({
        userId: req.user.userId,
      });

      res.status(200).json(profile);
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

      const { firstName, lastName, phone } = req.body;

      const profile = await this.updateProfileUseCase.execute({
        userId: req.user.userId,
        firstName,
        lastName,
        phone,
      });

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }
}
