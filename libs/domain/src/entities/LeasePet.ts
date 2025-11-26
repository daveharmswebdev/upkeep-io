export type PetSpecies = 'cat' | 'dog';

export interface LeasePet {
  id: string;
  leaseId: string;
  name: string;
  species: PetSpecies;
  createdAt: Date;
  updatedAt: Date;
}
