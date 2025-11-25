import { Profile, CreateProfileData } from '@domain/entities';

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  create(data: CreateProfileData): Promise<Profile>;
  update(userId: string, data: Partial<Profile>): Promise<Profile>;
}
