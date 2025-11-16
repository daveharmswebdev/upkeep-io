export interface LeaseOccupant {
  id: string;
  leaseId: string;
  personId: string;
  isAdult: boolean;
  moveInDate?: Date;
  moveOutDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
