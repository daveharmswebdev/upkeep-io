export type PersonType = 'OWNER' | 'FAMILY_MEMBER' | 'VENDOR' | 'LESSEE' | 'OCCUPANT';

export interface Person {
  id: string;
  userId: string;
  personType: PersonType;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonData {
  userId: string;
  personType: PersonType;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
}
