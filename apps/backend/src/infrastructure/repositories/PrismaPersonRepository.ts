import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { Person, CreatePersonData, PersonType } from '@domain/entities';

@injectable()
export class PrismaPersonRepository implements IPersonRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<Person | null> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) return null;

    return {
      ...person,
      personType: person.personType as PersonType,
      middleName: person.middleName ?? undefined,
      email: person.email ?? undefined,
      phone: person.phone ?? undefined,
      notes: person.notes ?? undefined,
    };
  }

  async findByUserId(userId: string): Promise<Person[]> {
    const persons = await this.prisma.person.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return persons.map((p: any) => ({
      ...p,
      personType: p.personType as PersonType,
      middleName: p.middleName ?? undefined,
      email: p.email ?? undefined,
      phone: p.phone ?? undefined,
      notes: p.notes ?? undefined,
    }));
  }

  async create(data: CreatePersonData): Promise<Person> {
    const person = await this.prisma.person.create({
      data: {
        userId: data.userId,
        personType: data.personType,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
      },
    });

    return {
      ...person,
      personType: person.personType as PersonType,
      middleName: person.middleName ?? undefined,
      email: person.email ?? undefined,
      phone: person.phone ?? undefined,
      notes: person.notes ?? undefined,
    };
  }

  async update(id: string, data: Partial<Person>): Promise<Person> {
    const person = await this.prisma.person.update({
      where: { id },
      data,
    });

    return {
      ...person,
      personType: person.personType as PersonType,
      middleName: person.middleName ?? undefined,
      email: person.email ?? undefined,
      phone: person.phone ?? undefined,
      notes: person.notes ?? undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.person.delete({
      where: { id },
    });
  }
}
