export interface Profile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileData {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
