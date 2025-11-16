import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { createLeaseSchema, updateLeaseSchema } from '@upkeep-io/validators';
import { CreateLeaseUseCase } from '../../application/lease/CreateLeaseUseCase';
import { GetLeaseByIdUseCase } from '../../application/lease/GetLeaseByIdUseCase';
import { UpdateLeaseUseCase } from '../../application/lease/UpdateLeaseUseCase';
import { DeleteLeaseUseCase } from '../../application/lease/DeleteLeaseUseCase';
import { ListLeasesUseCase } from '../../application/lease/ListLeasesUseCase';
import { ListLeasesByPropertyUseCase } from '../../application/lease/ListLeasesByPropertyUseCase';
import { AddLesseeToLeaseUseCase } from '../../application/lease/AddLesseeToLeaseUseCase';
import { RemoveLesseeFromLeaseUseCase } from '../../application/lease/RemoveLesseeFromLeaseUseCase';
import { AddOccupantToLeaseUseCase } from '../../application/lease/AddOccupantToLeaseUseCase';
import { RemoveOccupantFromLeaseUseCase } from '../../application/lease/RemoveOccupantFromLeaseUseCase';
import { AuthRequest } from '../middleware';

@injectable()
export class LeaseController {
  constructor(
    @inject(CreateLeaseUseCase) private createLeaseUseCase: CreateLeaseUseCase,
    @inject(GetLeaseByIdUseCase) private getLeaseByIdUseCase: GetLeaseByIdUseCase,
    @inject(UpdateLeaseUseCase) private updateLeaseUseCase: UpdateLeaseUseCase,
    @inject(DeleteLeaseUseCase) private deleteLeaseUseCase: DeleteLeaseUseCase,
    @inject(ListLeasesUseCase) private listLeasesUseCase: ListLeasesUseCase,
    @inject(ListLeasesByPropertyUseCase) private listLeasesByPropertyUseCase: ListLeasesByPropertyUseCase,
    @inject(AddLesseeToLeaseUseCase) private addLesseeToLeaseUseCase: AddLesseeToLeaseUseCase,
    @inject(RemoveLesseeFromLeaseUseCase) private removeLesseeFromLeaseUseCase: RemoveLesseeFromLeaseUseCase,
    @inject(AddOccupantToLeaseUseCase) private addOccupantToLeaseUseCase: AddOccupantToLeaseUseCase,
    @inject(RemoveOccupantFromLeaseUseCase) private removeOccupantFromLeaseUseCase: RemoveOccupantFromLeaseUseCase
  ) {}

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = createLeaseSchema.parse(req.body);
      const userId = req.user!.userId;

      const lease = await this.createLeaseUseCase.execute({
        ...validatedData,
        userId,
      });

      res.status(201).json(lease);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating lease:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const lease = await this.getLeaseByIdUseCase.execute(id, userId);

      res.json(lease);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error getting lease:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const validatedData = updateLeaseSchema.parse(req.body);

      const lease = await this.updateLeaseUseCase.execute(id, userId, validatedData);

      res.json(lease);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error updating lease:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await this.deleteLeaseUseCase.execute(id, userId);

      res.status(204).send();
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error deleting lease:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const leases = await this.listLeasesUseCase.execute(userId);

      res.json(leases);
    } catch (error: any) {
      console.error('Error listing leases:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listByProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const userId = req.user!.userId;

      const leases = await this.listLeasesByPropertyUseCase.execute(propertyId, userId);

      res.json(leases);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error listing leases by property:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async addLessee(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { personId, signedDate } = req.body;
      const userId = req.user!.userId;

      await this.addLesseeToLeaseUseCase.execute(id, personId, userId, signedDate);

      res.status(204).send();
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error adding lessee:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async removeLessee(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, personId } = req.params;
      const userId = req.user!.userId;
      const { voidedReason, newLeaseData } = req.body;

      const newLeaseId = await this.removeLesseeFromLeaseUseCase.execute(id, personId, userId, {
        voidedReason,
        newLeaseData,
      });

      res.json({ newLeaseId });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error removing lessee:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async addOccupant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { personId, isAdult, moveInDate } = req.body;
      const userId = req.user!.userId;

      await this.addOccupantToLeaseUseCase.execute(id, personId, isAdult, userId, moveInDate);

      res.status(204).send();
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error adding occupant:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async removeOccupant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, occupantId } = req.params;
      const userId = req.user!.userId;

      await this.removeOccupantFromLeaseUseCase.execute(id, occupantId, userId);

      res.status(204).send();
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Error removing occupant:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
