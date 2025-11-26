import { LeaseWithDetails } from '@domain/entities';

export interface CreateLeaseData {
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  depositPaidDate?: Date;
  petDeposit?: number;
  lessees: Array<{
    personId: string;
    signedDate?: Date;
  }>;
  occupants?: Array<{
    personId: string;
    isAdult: boolean;
    moveInDate?: Date;
  }>;
}

export interface AddLesseeData {
  leaseId: string;
  personId: string;
  signedDate?: Date;
}

export interface AddOccupantData {
  leaseId: string;
  personId: string;
  isAdult: boolean;
  moveInDate?: Date;
}

export interface AddPetData {
  leaseId: string;
  name: string;
  species: 'cat' | 'dog';
}

export interface ILeaseRepository {
  findById(id: string): Promise<LeaseWithDetails | null>;
  findByUserId(userId: string): Promise<LeaseWithDetails[]>;
  findByPropertyId(propertyId: string): Promise<LeaseWithDetails[]>;
  findActiveByPropertyId(propertyId: string): Promise<LeaseWithDetails | null>;
  create(data: CreateLeaseData): Promise<LeaseWithDetails>;
  update(id: string, data: Partial<LeaseWithDetails>): Promise<LeaseWithDetails>;
  softDelete(id: string): Promise<void>;
  addLessee(data: AddLesseeData): Promise<void>;
  removeLessee(leaseId: string, personId: string): Promise<void>;
  addOccupant(data: AddOccupantData): Promise<void>;
  removeOccupant(leaseId: string, occupantId: string): Promise<void>;
  addPet(data: AddPetData): Promise<void>;
  removePet(leaseId: string, petId: string): Promise<void>;
  voidLease(id: string, voidedReason: string): Promise<void>;
}
