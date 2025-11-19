import { DomainError } from './DomainError';

describe('DomainError', () => {
  describe('constructor', () => {
    it('should create error with provided message', () => {
      const message = 'Test error message';
      const error = new DomainError(message);

      expect(error.message).toBe(message);
    });

    it('should set name to "DomainError"', () => {
      const error = new DomainError('Test message');

      expect(error.name).toBe('DomainError');
    });

    it('should be instance of Error', () => {
      const error = new DomainError('Test message');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new DomainError('Test message');

      expect(error).toBeInstanceOf(DomainError);
    });

    it('should have correct prototype chain', () => {
      const error = new DomainError('Test message');

      expect(Object.getPrototypeOf(error)).toBe(DomainError.prototype);
    });

    it('should preserve stack trace', () => {
      const error = new DomainError('Test message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DomainError');
    });
  });

  describe('message handling', () => {
    it('should accept empty string message', () => {
      const error = new DomainError('');

      expect(error.message).toBe('');
    });

    it('should accept multiline message', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const error = new DomainError(message);

      expect(error.message).toBe(message);
    });

    it('should accept message with special characters', () => {
      const message = 'Error: @#$%^&*()!';
      const error = new DomainError(message);

      expect(error.message).toBe(message);
    });

    it('should accept very long message', () => {
      const message = 'A'.repeat(10000);
      const error = new DomainError(message);

      expect(error.message).toBe(message);
    });

    it('should accept unicode characters in message', () => {
      const message = 'エラーメッセージ 错误信息';
      const error = new DomainError(message);

      expect(error.message).toBe(message);
    });
  });

  describe('inheritance', () => {
    it('should work with instanceof checks', () => {
      const error = new DomainError('Test');

      expect(error instanceof DomainError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as Error', () => {
      try {
        throw new DomainError('Test error');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(DomainError);
      }
    });

    it('should be distinguishable from generic Error', () => {
      const domainError = new DomainError('Domain error');
      const genericError = new Error('Generic error');

      expect(domainError).toBeInstanceOf(DomainError);
      expect(genericError).not.toBeInstanceOf(DomainError);
    });
  });

  describe('error throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new DomainError('Test error');
      }).toThrow(DomainError);
    });

    it('should contain message when thrown', () => {
      const message = 'Specific error message';

      expect(() => {
        throw new DomainError(message);
      }).toThrow(message);
    });

    it('should be catchable with try-catch', () => {
      let caught = false;

      try {
        throw new DomainError('Test');
      } catch (err) {
        caught = true;
        expect(err).toBeInstanceOf(DomainError);
      }

      expect(caught).toBe(true);
    });
  });
});
