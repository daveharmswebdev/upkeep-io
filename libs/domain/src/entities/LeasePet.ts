export type PetSpecies = 'cat' | 'dog';

export interface LeasePet {
  id: string;
  leaseId: string;
  name: string;
  species: PetSpecies;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
