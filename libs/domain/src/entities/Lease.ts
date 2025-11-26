export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  MONTH_TO_MONTH = 'MONTH_TO_MONTH',
  ENDED = 'ENDED',
  VOIDED = 'VOIDED',
}

export interface Lease {
  id: string;
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  depositPaidDate?: Date;
  petDeposit?: number;
  status: LeaseStatus;
  voidedReason?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseWithDetails extends Lease {
  lessees: Array<{
    id: string;
    personId: string;
    signedDate?: Date;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      email: string;
      phone: string;
    };
  }>;
  occupants: Array<{
    id: string;
    personId: string;
    isAdult: boolean;
    moveInDate?: Date;
    moveOutDate?: Date;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      email?: string;
      phone?: string;
    };
  }>;
  pets: Array<{
    id: string;
    leaseId: string;
    name: string;
    species: 'cat' | 'dog';
    createdAt: Date;
    updatedAt: Date;
  }>;
}
