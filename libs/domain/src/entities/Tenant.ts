export interface Tenant {
  id: string;
  userId: string;
  personId: string;
  propertyId: string;
  leaseStartDate: Date;
  leaseEndDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantData {
  userId: string;
  personId: string;
  propertyId: string;
  leaseStartDate: Date;
  leaseEndDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  notes?: string;
}
