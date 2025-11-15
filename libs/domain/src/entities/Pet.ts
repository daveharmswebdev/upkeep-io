export interface Pet {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  breed?: string;
  weight?: number;
  petDeposit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetData {
  tenantId: string;
  name: string;
  type: string;
  breed?: string;
  weight?: number;
  petDeposit?: number;
}
