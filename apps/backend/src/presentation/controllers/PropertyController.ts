import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { CreatePropertyUseCase, ListPropertiesUseCase } from '../../application/property';
import { AuthRequest } from '../middleware';

@injectable()
export class PropertyController {
  constructor(
    @inject(CreatePropertyUseCase) private createPropertyUseCase: CreatePropertyUseCase,
    @inject(ListPropertiesUseCase) private listPropertiesUseCase: ListPropertiesUseCase
  ) {}

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { address, city, state, zipCode, nickname, purchaseDate, purchasePrice } = req.body;

      const property = await this.createPropertyUseCase.execute({
        userId: req.user.userId,
        address,
        city,
        state,
        zipCode,
        nickname,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice,
      });

      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const properties = await this.listPropertiesUseCase.execute({
        userId: req.user.userId,
      });

      res.status(200).json({ properties });
    } catch (error) {
      next(error);
    }
  }
}
