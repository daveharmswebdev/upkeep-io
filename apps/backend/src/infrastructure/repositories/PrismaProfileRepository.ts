import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { Profile, CreateProfileData } from '@domain/entities';

@injectable()
export class PrismaProfileRepository implements IProfileRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName ?? undefined,
      lastName: profile.lastName ?? undefined,
      phone: profile.phone ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async create(data: CreateProfileData): Promise<Profile> {
    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName ?? undefined,
      lastName: profile.lastName ?? undefined,
      phone: profile.phone ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async update(userId: string, data: Partial<Profile>): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName ?? undefined,
      lastName: profile.lastName ?? undefined,
      phone: profile.phone ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
