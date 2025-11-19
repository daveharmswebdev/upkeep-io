import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import {
  CreatePropertyUseCase,
  ListPropertiesUseCase,
  GetPropertyByIdUseCase,
  UpdatePropertyUseCase,
  DeletePropertyUseCase,
} from '../../application/property';
import { AuthRequest } from '../middleware';

@injectable()
export class PropertyController {
  constructor(
    @inject(CreatePropertyUseCase) private createPropertyUseCase: CreatePropertyUseCase,
    @inject(ListPropertiesUseCase) private listPropertiesUseCase: ListPropertiesUseCase,
    @inject(GetPropertyByIdUseCase) private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    @inject(UpdatePropertyUseCase) private updatePropertyUseCase: UpdatePropertyUseCase,
    @inject(DeletePropertyUseCase) private deletePropertyUseCase: DeletePropertyUseCase
  ) {}

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { street, address2, city, state, zipCode, nickname, purchaseDate, purchasePrice } = req.body;

      const property = await this.createPropertyUseCase.execute({
        userId: req.user.userId,
        street,
        address2,
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

      res.status(200).json(properties);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const property = await this.getPropertyByIdUseCase.execute({
        userId: req.user.userId,
        propertyId: req.params.id,
      });

      res.status(200).json(property);
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

      const { street, address2, city, state, zipCode, nickname, purchaseDate, purchasePrice } = req.body;

      const property = await this.updatePropertyUseCase.execute({
        userId: req.user.userId,
        propertyId: req.params.id,
        street,
        address2,
        city,
        state,
        zipCode,
        nickname,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice,
      });

      res.status(200).json(property);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.deletePropertyUseCase.execute({
        userId: req.user.userId,
        propertyId: req.params.id,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
