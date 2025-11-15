import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import {
  CreateTenantUseCase,
  ListTenantsUseCase,
  GetTenantByIdUseCase,
  UpdateTenantUseCase,
  DeleteTenantUseCase,
  ListTenantsByPropertyUseCase,
} from '../../application/tenant';
import { AuthRequest } from '../middleware';

@injectable()
export class TenantController {
  constructor(
    @inject(CreateTenantUseCase) private createTenantUseCase: CreateTenantUseCase,
    @inject(ListTenantsUseCase) private listTenantsUseCase: ListTenantsUseCase,
    @inject(GetTenantByIdUseCase) private getTenantByIdUseCase: GetTenantByIdUseCase,
    @inject(UpdateTenantUseCase) private updateTenantUseCase: UpdateTenantUseCase,
    @inject(DeleteTenantUseCase) private deleteTenantUseCase: DeleteTenantUseCase,
    @inject(ListTenantsByPropertyUseCase) private listTenantsByPropertyUseCase: ListTenantsByPropertyUseCase
  ) {}

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        firstName,
        lastName,
        middleName,
        email,
        phone,
        personNotes,
        propertyId,
        leaseStartDate,
        leaseEndDate,
        monthlyRent,
        securityDeposit,
        tenantNotes,
      } = req.body;

      const tenant = await this.createTenantUseCase.execute({
        userId: req.user.userId,
        firstName,
        lastName,
        middleName,
        email,
        phone,
        personNotes,
        propertyId,
        leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : new Date(),
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : undefined,
        monthlyRent,
        securityDeposit,
        tenantNotes,
      });

      res.status(201).json(tenant);
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

      const tenants = await this.listTenantsUseCase.execute({
        userId: req.user.userId,
      });

      res.status(200).json(tenants);
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

      const tenant = await this.getTenantByIdUseCase.execute({
        userId: req.user.userId,
        tenantId: req.params.id,
      });

      res.status(200).json(tenant);
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

      const { propertyId, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit, tenantNotes } = req.body;

      const tenant = await this.updateTenantUseCase.execute({
        userId: req.user.userId,
        tenantId: req.params.id,
        propertyId,
        leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : undefined,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : undefined,
        monthlyRent,
        securityDeposit,
        tenantNotes,
      });

      res.status(200).json(tenant);
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

      await this.deleteTenantUseCase.execute({
        userId: req.user.userId,
        tenantId: req.params.id,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async listByProperty(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tenants = await this.listTenantsByPropertyUseCase.execute({
        userId: req.user.userId,
        propertyId: req.params.propertyId,
      });

      res.status(200).json(tenants);
    } catch (error) {
      next(error);
    }
  }
}
