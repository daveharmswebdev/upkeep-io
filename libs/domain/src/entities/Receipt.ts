export type ReceiptCategory =
  | 'materials'
  | 'supplies'
  | 'tools'
  | 'appliances'
  | 'fixtures'
  | 'landscaping'
  | 'cleaning'
  | 'other';

export interface Receipt {
  id: string;
  propertyId: string;
  userId: string;
  amount: number;
  category: ReceiptCategory;
  storeName: string;
  purchaseDate: Date;
  description?: string;
  receiptImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReceiptData {
  propertyId: string;
  userId: string;
  amount: number;
  category: ReceiptCategory;
  storeName: string;
  purchaseDate: Date;
  description?: string;
  receiptImageUrl?: string;
}

export interface UpdateReceiptData {
  amount?: number;
  category?: ReceiptCategory;
  storeName?: string;
  purchaseDate?: Date;
  description?: string;
  receiptImageUrl?: string;
}
