export interface Property {
  id: string;
  userId: string;
  street: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  nickname?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyData {
  userId: string;
  street: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  nickname?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}
