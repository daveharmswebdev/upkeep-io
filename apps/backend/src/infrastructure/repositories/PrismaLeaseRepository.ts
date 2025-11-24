import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { LeaseWithDetails, LeaseStatus } from '@upkeep-io/domain';
import {
  ILeaseRepository,
  CreateLeaseData,
  AddLesseeData,
  AddOccupantData,
} from '../../domain/repositories/ILeaseRepository';

@injectable()
export class PrismaLeaseRepository implements ILeaseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private toLeaseWithDetails(prismaLease: any): LeaseWithDetails {
    return {
      id: prismaLease.id,
      userId: prismaLease.userId,
      propertyId: prismaLease.propertyId,
      startDate: prismaLease.startDate,
      endDate: prismaLease.endDate,
      monthlyRent: prismaLease.monthlyRent ? parseFloat(prismaLease.monthlyRent.toString()) : undefined,
      securityDeposit: prismaLease.securityDeposit
        ? parseFloat(prismaLease.securityDeposit.toString())
        : undefined,
      depositPaidDate: prismaLease.depositPaidDate,
      notes: prismaLease.notes,
      status: prismaLease.status as LeaseStatus,
      voidedReason: prismaLease.voidedReason,
      deletedAt: prismaLease.deletedAt,
      createdAt: prismaLease.createdAt,
      updatedAt: prismaLease.updatedAt,
      lessees: prismaLease.lessees
        ?.filter((lessee: any) => !lessee.deletedAt)
        .map((lessee: any) => ({
          id: lessee.id,
          personId: lessee.personId,
          signedDate: lessee.signedDate,
          person: {
            id: lessee.person.id,
            firstName: lessee.person.firstName,
            lastName: lessee.person.lastName,
            middleName: lessee.person.middleName,
            email: lessee.person.email || '',
            phone: lessee.person.phone || '',
          },
        })) || [],
      occupants: prismaLease.occupants
        ?.filter((occupant: any) => !occupant.deletedAt)
        .map((occupant: any) => ({
          id: occupant.id,
          personId: occupant.personId,
          isAdult: occupant.isAdult,
          moveInDate: occupant.moveInDate,
          moveOutDate: occupant.moveOutDate,
          person: {
            id: occupant.person.id,
            firstName: occupant.person.firstName,
            lastName: occupant.person.lastName,
            middleName: occupant.person.middleName,
            email: occupant.person.email,
            phone: occupant.person.phone,
          },
        })) || [],
    };
  }

  async findById(id: string): Promise<LeaseWithDetails | null> {
    const lease = await this.prisma.lease.findFirst({
      where: { id, deletedAt: null },
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
    });

    return lease ? this.toLeaseWithDetails(lease) : null;
  }

  async findByUserId(userId: string): Promise<LeaseWithDetails[]> {
    const leases = await this.prisma.lease.findMany({
      where: { userId, deletedAt: null },
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return leases.map((lease: any) => this.toLeaseWithDetails(lease));
  }

  async findByPropertyId(propertyId: string): Promise<LeaseWithDetails[]> {
    const leases = await this.prisma.lease.findMany({
      where: { propertyId, deletedAt: null },
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return leases.map((lease: any) => this.toLeaseWithDetails(lease));
  }

  async findActiveByPropertyId(propertyId: string): Promise<LeaseWithDetails | null> {
    const lease = await this.prisma.lease.findFirst({
      where: {
        propertyId,
        deletedAt: null,
        status: {
          in: ['ACTIVE', 'MONTH_TO_MONTH'],
        },
      },
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
    });

    return lease ? this.toLeaseWithDetails(lease) : null;
  }

  async create(data: CreateLeaseData): Promise<LeaseWithDetails> {
    const lease = await this.prisma.lease.create({
      data: {
        userId: data.userId,
        propertyId: data.propertyId,
        startDate: data.startDate,
        endDate: data.endDate,
        monthlyRent: data.monthlyRent,
        securityDeposit: data.securityDeposit,
        depositPaidDate: data.depositPaidDate,
        notes: data.notes,
        status: 'ACTIVE',
        lessees: {
          create: data.lessees.map((lessee) => ({
            personId: lessee.personId,
            signedDate: lessee.signedDate,
          })),
        },
        occupants: data.occupants
          ? {
              create: data.occupants.map((occupant) => ({
                personId: occupant.personId,
                isAdult: occupant.isAdult,
                moveInDate: occupant.moveInDate,
              })),
            }
          : undefined,
      },
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.toLeaseWithDetails(lease);
  }

  async update(id: string, data: Partial<LeaseWithDetails>): Promise<LeaseWithDetails> {
    // Check if lease exists and is not soft-deleted
    const existingLease = await this.prisma.lease.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingLease) {
      throw new Error('Lease not found or has been deleted');
    }

    const updateData: any = {};
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    // Allow explicit null to clear endDate (for MONTH_TO_MONTH leases)
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.monthlyRent !== undefined) updateData.monthlyRent = data.monthlyRent;
    if (data.securityDeposit !== undefined) updateData.securityDeposit = data.securityDeposit;
    if (data.depositPaidDate !== undefined) updateData.depositPaidDate = data.depositPaidDate;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.voidedReason !== undefined) updateData.voidedReason = data.voidedReason;

    const updatedLease = await this.prisma.lease.update({
      where: { id },
      data: updateData,
      include: {
        lessees: {
          include: {
            person: true,
          },
        },
        occupants: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.toLeaseWithDetails(updatedLease);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.lease.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Also soft-delete all lessees and occupants
    await this.prisma.leaseLessee.updateMany({
      where: { leaseId: id },
      data: { deletedAt: new Date() },
    });

    await this.prisma.leaseOccupant.updateMany({
      where: { leaseId: id },
      data: { deletedAt: new Date() },
    });
  }

  async addLessee(data: AddLesseeData): Promise<void> {
    await this.prisma.leaseLessee.create({
      data: {
        leaseId: data.leaseId,
        personId: data.personId,
        signedDate: data.signedDate,
      },
    });
  }

  async removeLessee(leaseId: string, personId: string): Promise<void> {
    const lessee = await this.prisma.leaseLessee.findFirst({
      where: {
        leaseId,
        personId,
        deletedAt: null,
      },
    });

    if (lessee) {
      await this.prisma.leaseLessee.update({
        where: { id: lessee.id },
        data: { deletedAt: new Date() },
      });
    }
  }

  async addOccupant(data: AddOccupantData): Promise<void> {
    await this.prisma.leaseOccupant.create({
      data: {
        leaseId: data.leaseId,
        personId: data.personId,
        isAdult: data.isAdult,
        moveInDate: data.moveInDate,
      },
    });
  }

  async removeOccupant(_leaseId: string, occupantId: string): Promise<void> {
    await this.prisma.leaseOccupant.update({
      where: { id: occupantId },
      data: { deletedAt: new Date() },
    });
  }

  async voidLease(id: string, voidedReason: string): Promise<void> {
    await this.prisma.lease.update({
      where: { id },
      data: {
        status: 'VOIDED',
        voidedReason,
      },
    });
  }
}
