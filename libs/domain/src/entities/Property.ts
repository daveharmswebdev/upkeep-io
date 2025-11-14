export interface Property {
  id: string;
  userId: string;
  address: string;
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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  nickname?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}
