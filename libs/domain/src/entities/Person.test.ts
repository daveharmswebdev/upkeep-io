import { Person, PersonType, CreatePersonData } from './Person';

describe('Person types', () => {
  describe('PersonType', () => {
    it('should have OWNER type', () => {
      const type: PersonType = 'OWNER';
      expect(type).toBe('OWNER');
    });

    it('should have FAMILY_MEMBER type', () => {
      const type: PersonType = 'FAMILY_MEMBER';
      expect(type).toBe('FAMILY_MEMBER');
    });

    it('should have VENDOR type', () => {
      const type: PersonType = 'VENDOR';
      expect(type).toBe('VENDOR');
    });

    it('should have LESSEE type', () => {
      const type: PersonType = 'LESSEE';
      expect(type).toBe('LESSEE');
    });

    it('should have OCCUPANT type', () => {
      const type: PersonType = 'OCCUPANT';
      expect(type).toBe('OCCUPANT');
    });

    it('should accept all PersonType values', () => {
      const types: PersonType[] = ['OWNER', 'FAMILY_MEMBER', 'VENDOR', 'LESSEE', 'OCCUPANT'];
      types.forEach((type) => {
        const person: Person = {
          id: '123',
          userId: '456',
          personType: type,
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(person.personType).toBe(type);
      });
    });
  });

  describe('Person interface', () => {
    it('should accept valid Person object with required fields only', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'OWNER',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.id).toBe('123');
      expect(person.userId).toBe('456');
      expect(person.personType).toBe('OWNER');
      expect(person.firstName).toBe('John');
      expect(person.lastName).toBe('Doe');
    });

    it('should accept Person with all optional fields', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'VENDOR',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Michael',
        email: 'john@example.com',
        phone: '1234567890',
        notes: 'Preferred HVAC vendor',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.middleName).toBe('Michael');
      expect(person.email).toBe('john@example.com');
      expect(person.phone).toBe('1234567890');
      expect(person.notes).toBe('Preferred HVAC vendor');
    });

    it('should accept Person without optional fields', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'FAMILY_MEMBER',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.middleName).toBeUndefined();
      expect(person.email).toBeUndefined();
      expect(person.phone).toBeUndefined();
      expect(person.notes).toBeUndefined();
    });

    it('should accept Person with only email (no phone)', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'LESSEE',
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.email).toBe('alice@example.com');
      expect(person.phone).toBeUndefined();
    });

    it('should accept Person with only phone (no email)', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'OCCUPANT',
        firstName: 'Bob',
        lastName: 'Builder',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.phone).toBe('0987654321');
      expect(person.email).toBeUndefined();
    });

    it('should accept child occupant without email or phone', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'OCCUPANT',
        firstName: 'Tommy',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.email).toBeUndefined();
      expect(person.phone).toBeUndefined();
    });

    it('should have all required fields defined', () => {
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'OWNER',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person).toHaveProperty('id');
      expect(person).toHaveProperty('userId');
      expect(person).toHaveProperty('personType');
      expect(person).toHaveProperty('firstName');
      expect(person).toHaveProperty('lastName');
      expect(person).toHaveProperty('createdAt');
      expect(person).toHaveProperty('updatedAt');
    });

    it('should support Date objects for timestamps', () => {
      const now = new Date();
      const person: Person = {
        id: '123',
        userId: '456',
        personType: 'VENDOR',
        firstName: 'Test',
        lastName: 'User',
        createdAt: now,
        updatedAt: now,
      };

      expect(person.createdAt).toBeInstanceOf(Date);
      expect(person.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('CreatePersonData interface', () => {
    it('should accept valid CreatePersonData object', () => {
      const data: CreatePersonData = {
        userId: '456',
        personType: 'OWNER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      expect(data.userId).toBe('456');
      expect(data.personType).toBe('OWNER');
      expect(data.firstName).toBe('John');
      expect(data.lastName).toBe('Doe');
      expect(data.email).toBe('john@example.com');
      expect(data.phone).toBe('1234567890');
    });

    it('should accept CreatePersonData with all optional fields', () => {
      const data: CreatePersonData = {
        userId: '456',
        personType: 'VENDOR',
        firstName: 'Bob',
        lastName: 'Builder',
        middleName: 'The',
        email: 'bob@construction.com',
        phone: '5551234567',
        notes: 'Best contractor in town',
      };

      expect(data.middleName).toBe('The');
      expect(data.notes).toBe('Best contractor in town');
    });

    it('should not have id, createdAt, or updatedAt fields', () => {
      const data: CreatePersonData = {
        userId: '456',
        personType: 'OWNER',
        firstName: 'Test',
        lastName: 'User',
      };

      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('createdAt');
      expect(data).not.toHaveProperty('updatedAt');
    });

    it('should accept all PersonType values', () => {
      const types: PersonType[] = ['OWNER', 'FAMILY_MEMBER', 'VENDOR', 'LESSEE', 'OCCUPANT'];

      types.forEach((type) => {
        const data: CreatePersonData = {
          userId: '456',
          personType: type,
          firstName: 'Test',
          lastName: 'User',
        };

        expect(data.personType).toBe(type);
      });
    });
  });

  describe('type compatibility', () => {
    it('should allow assigning CreatePersonData fields to Person', () => {
      const createData: CreatePersonData = {
        userId: '456',
        personType: 'VENDOR',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        notes: 'Excellent plumber',
      };

      const person: Person = {
        ...createData,
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(person.userId).toBe(createData.userId);
      expect(person.personType).toBe(createData.personType);
      expect(person.firstName).toBe(createData.firstName);
      expect(person.lastName).toBe(createData.lastName);
      expect(person.email).toBe(createData.email);
      expect(person.phone).toBe(createData.phone);
      expect(person.notes).toBe(createData.notes);
    });

    it('should handle different name formats', () => {
      const names = [
        { first: 'John', last: 'Doe' },
        { first: "O'Brien", last: 'Smith-Jones' },
        { first: 'José', last: 'García' },
        { first: 'X', last: 'Y' },
      ];

      names.forEach(({ first, last }) => {
        const person: Person = {
          id: '123',
          userId: '456',
          personType: 'OWNER',
          firstName: first,
          lastName: last,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(person.firstName).toBe(first);
        expect(person.lastName).toBe(last);
      });
    });

    it('should handle different email formats', () => {
      const emails = [
        'simple@example.com',
        'with+tag@example.com',
        'with.dots@example.com',
        'user@subdomain.example.com',
      ];

      emails.forEach((email) => {
        const person: Person = {
          id: '123',
          userId: '456',
          personType: 'LESSEE',
          firstName: 'Test',
          lastName: 'User',
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(person.email).toBe(email);
      });
    });

    it('should handle different phone formats', () => {
      const phones = [
        '1234567890',
        '+1 (555) 123-4567',
        '+44 20 7946 0958',
        '555.123.4567',
      ];

      phones.forEach((phone) => {
        const person: Person = {
          id: '123',
          userId: '456',
          personType: 'VENDOR',
          firstName: 'Test',
          lastName: 'User',
          phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(person.phone).toBe(phone);
      });
    });
  });
});
