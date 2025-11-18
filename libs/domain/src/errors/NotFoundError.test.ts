import { NotFoundError } from './NotFoundError';
import { DomainError } from './DomainError';

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create error with formatted message', () => {
      const resource = 'Property';
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const error = new NotFoundError(resource, id);

      expect(error.message).toBe(`${resource} with id ${id} not found`);
    });

    it('should set name to "NotFoundError"', () => {
      const error = new NotFoundError('User', '123');

      expect(error.name).toBe('NotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new NotFoundError('User', '123');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new NotFoundError('User', '123');

      expect(error).toBeInstanceOf(DomainError);
    });

    it('should be instance of NotFoundError', () => {
      const error = new NotFoundError('User', '123');

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should have correct prototype chain', () => {
      const error = new NotFoundError('User', '123');

      expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
    });

    it('should preserve stack trace', () => {
      const error = new NotFoundError('User', '123');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });
  });

  describe('message formatting', () => {
    it('should format message with resource and id', () => {
      const error = new NotFoundError('Property', 'abc-123');

      expect(error.message).toBe('Property with id abc-123 not found');
    });

    it('should handle different resource names', () => {
      const resources = ['User', 'Property', 'Lease', 'Vendor', 'MaintenanceWork'];
      const id = '123';

      resources.forEach((resource) => {
        const error = new NotFoundError(resource, id);
        expect(error.message).toBe(`${resource} with id ${id} not found`);
      });
    });

    it('should handle different id formats', () => {
      const ids = [
        '123',
        'abc-123',
        '123e4567-e89b-12d3-a456-426614174000',
        'user_123',
        '999999999',
      ];

      ids.forEach((id) => {
        const error = new NotFoundError('Resource', id);
        expect(error.message).toBe(`Resource with id ${id} not found`);
      });
    });

    it('should handle empty resource name', () => {
      const error = new NotFoundError('', '123');

      expect(error.message).toBe(' with id 123 not found');
    });

    it('should handle empty id', () => {
      const error = new NotFoundError('User', '');

      expect(error.message).toBe('User with id  not found');
    });

    it('should handle both empty resource and id', () => {
      const error = new NotFoundError('', '');

      expect(error.message).toBe(' with id  not found');
    });

    it('should handle resource name with spaces', () => {
      const error = new NotFoundError('Maintenance Work', '123');

      expect(error.message).toBe('Maintenance Work with id 123 not found');
    });

    it('should handle id with special characters', () => {
      const error = new NotFoundError('User', 'abc-123_xyz@456');

      expect(error.message).toBe('User with id abc-123_xyz@456 not found');
    });

    it('should handle unicode characters in resource name', () => {
      const error = new NotFoundError('Usuario', '123');

      expect(error.message).toBe('Usuario with id 123 not found');
    });

    it('should handle unicode characters in id', () => {
      const error = new NotFoundError('User', 'ユーザー123');

      expect(error.message).toBe('User with id ユーザー123 not found');
    });
  });

  describe('inheritance', () => {
    it('should work with instanceof checks', () => {
      const error = new NotFoundError('User', '123');

      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof DomainError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as DomainError', () => {
      try {
        throw new NotFoundError('User', '123');
      } catch (err) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new NotFoundError('User', '123');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    it('should be distinguishable from generic DomainError', () => {
      const notFoundError = new NotFoundError('User', '123');
      const domainError = new DomainError('Domain error');

      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(domainError).not.toBeInstanceOf(NotFoundError);
    });

    it('should be distinguishable from generic Error', () => {
      const notFoundError = new NotFoundError('User', '123');
      const genericError = new Error('Generic error');

      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(genericError).not.toBeInstanceOf(NotFoundError);
    });
  });

  describe('error throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new NotFoundError('User', '123');
      }).toThrow(NotFoundError);
    });

    it('should contain formatted message when thrown', () => {
      expect(() => {
        throw new NotFoundError('Property', 'abc-123');
      }).toThrow('Property with id abc-123 not found');
    });

    it('should be catchable with try-catch', () => {
      let caught = false;
      let caughtError: NotFoundError | null = null;

      try {
        throw new NotFoundError('User', '999');
      } catch (err) {
        caught = true;
        caughtError = err as NotFoundError;
      }

      expect(caught).toBe(true);
      expect(caughtError).toBeInstanceOf(NotFoundError);
      expect(caughtError?.message).toBe('User with id 999 not found');
    });
  });

  describe('real-world usage', () => {
    it('should work in repository pattern', () => {
      // Simulating repository method
      const findById = (id: string) => {
        // Simulate not finding resource
        throw new NotFoundError('Property', id);
      };

      expect(() => findById('123')).toThrow(NotFoundError);
      expect(() => findById('123')).toThrow('Property with id 123 not found');
    });

    it('should work with UUID identifiers', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const error = new NotFoundError('Lease', uuid);

      expect(error.message).toBe(`Lease with id ${uuid} not found`);
    });

    it('should work with numeric string identifiers', () => {
      const error = new NotFoundError('User', '12345');

      expect(error.message).toBe('User with id 12345 not found');
    });
  });
});
