import { Person, CreatePersonData } from '@domain/entities';

export interface IPersonRepository {
  findById(id: string): Promise<Person | null>;
  findByUserId(userId: string): Promise<Person[]>;
  create(data: CreatePersonData): Promise<Person>;
  update(id: string, data: Partial<Person>): Promise<Person>;
  delete(id: string): Promise<void>;
}
