export interface LeaseLessee {
  id: string;
  leaseId: string;
  personId: string;
  signedDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
