import { ValidationError } from './ValidationError';
import { DomainError } from './DomainError';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create error with provided message', () => {
      const message = 'Validation failed';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should set name to "ValidationError"', () => {
      const error = new ValidationError('Invalid input');

      expect(error.name).toBe('ValidationError');
    });

    it('should be instance of Error', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(DomainError);
    });

    it('should be instance of ValidationError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have correct prototype chain', () => {
      const error = new ValidationError('Invalid input');

      expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
    });

    it('should preserve stack trace', () => {
      const error = new ValidationError('Invalid input');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('message handling', () => {
    it('should accept empty string message', () => {
      const error = new ValidationError('');

      expect(error.message).toBe('');
    });

    it('should accept simple validation message', () => {
      const message = 'Email is required';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept complex validation message', () => {
      const message = 'Invalid input: Email must be valid format and password must be at least 8 characters';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept multiline message', () => {
      const message = 'Validation errors:\n- Email is required\n- Password too short\n- Name cannot be empty';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept message with special characters', () => {
      const message = 'Invalid value: @#$%^&*()!';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept very long message', () => {
      const message = 'Validation failed: ' + 'A'.repeat(10000);
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept unicode characters in message', () => {
      const message = '検証エラー: メールアドレスが無効です';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should accept JSON-formatted validation errors', () => {
      const message = JSON.stringify({
        email: 'Invalid email format',
        password: 'Password too short',
      });
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });
  });

  describe('inheritance', () => {
    it('should work with instanceof checks', () => {
      const error = new ValidationError('Invalid input');

      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof DomainError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as DomainError', () => {
      try {
        throw new ValidationError('Invalid input');
      } catch (err) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err).toBeInstanceOf(ValidationError);
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('Invalid input');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    it('should be distinguishable from generic DomainError', () => {
      const validationError = new ValidationError('Invalid input');
      const domainError = new DomainError('Domain error');

      expect(validationError).toBeInstanceOf(ValidationError);
      expect(domainError).not.toBeInstanceOf(ValidationError);
    });

    it('should be distinguishable from generic Error', () => {
      const validationError = new ValidationError('Invalid input');
      const genericError = new Error('Generic error');

      expect(validationError).toBeInstanceOf(ValidationError);
      expect(genericError).not.toBeInstanceOf(ValidationError);
    });
  });

  describe('error throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Invalid input');
      }).toThrow(ValidationError);
    });

    it('should contain message when thrown', () => {
      const message = 'Email format is invalid';

      expect(() => {
        throw new ValidationError(message);
      }).toThrow(message);
    });

    it('should be catchable with try-catch', () => {
      let caught = false;
      let caughtError: ValidationError | null = null;

      try {
        throw new ValidationError('Invalid email');
      } catch (err) {
        caught = true;
        caughtError = err as ValidationError;
      }

      expect(caught).toBe(true);
      expect(caughtError).toBeInstanceOf(ValidationError);
      expect(caughtError?.message).toBe('Invalid email');
    });
  });

  describe('real-world usage', () => {
    it('should work for field validation', () => {
      const validateEmail = (email: string) => {
        if (!email.includes('@')) {
          throw new ValidationError('Email must contain @ symbol');
        }
      };

      expect(() => validateEmail('invalid')).toThrow(ValidationError);
      expect(() => validateEmail('invalid')).toThrow('Email must contain @ symbol');
      expect(() => validateEmail('valid@example.com')).not.toThrow();
    });

    it('should work for multiple validation errors', () => {
      const validateUser = (email: string, password: string) => {
        const errors: string[] = [];

        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        if (password && password.length < 8) errors.push('Password must be at least 8 characters');

        if (errors.length > 0) {
          throw new ValidationError(errors.join(', '));
        }
      };

      expect(() => validateUser('', '')).toThrow(ValidationError);
      expect(() => validateUser('', '')).toThrow('Email is required, Password is required');
      expect(() => validateUser('test@example.com', 'short')).toThrow('Password must be at least 8 characters');
      expect(() => validateUser('test@example.com', 'validpassword')).not.toThrow();
    });

    it('should work with Zod-style error messages', () => {
      const zodErrorMessage = JSON.stringify([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['email'],
          message: 'Email is required',
        },
      ]);

      const error = new ValidationError(zodErrorMessage);

      expect(error.message).toBe(zodErrorMessage);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work for business rule validation', () => {
      const validateLeaseDate = (startDate: Date, endDate: Date) => {
        if (startDate >= endDate) {
          throw new ValidationError('Start date must be before end date');
        }
      };

      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');

      expect(() => validateLeaseDate(start, end)).toThrow(ValidationError);
      expect(() => validateLeaseDate(start, end)).toThrow('Start date must be before end date');
    });

    it('should work for domain constraint validation', () => {
      const validateMonthlyRent = (rent: number) => {
        if (rent <= 0) {
          throw new ValidationError('Monthly rent must be positive');
        }
        if (rent > 1000000) {
          throw new ValidationError('Monthly rent exceeds maximum allowed value');
        }
      };

      expect(() => validateMonthlyRent(0)).toThrow('Monthly rent must be positive');
      expect(() => validateMonthlyRent(-100)).toThrow('Monthly rent must be positive');
      expect(() => validateMonthlyRent(1500000)).toThrow('Monthly rent exceeds maximum allowed value');
      expect(() => validateMonthlyRent(2000)).not.toThrow();
    });
  });
});
