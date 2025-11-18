import jwt from 'jsonwebtoken';
import { generateToken } from './generate';
import { JwtPayload, JwtConfig } from './types';

describe('generateToken', () => {
  const testPayload: JwtPayload = {
    userId: 'user-123',
    email: 'test@example.com',
  };

  const testSecret = 'test-secret-key';

  describe('token generation', () => {
    it('should generate a valid JWT token with provided payload and config', () => {
      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      const token = generateToken(testPayload, config);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should use default expiresIn of "7d" when not provided', () => {
      const config: JwtConfig = {
        secret: testSecret,
      };

      const token = generateToken(testPayload, config);
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded).toBeDefined();
      expect(decoded.payload.userId).toBe(testPayload.userId);
      expect(decoded.payload.email).toBe(testPayload.email);

      // Verify expiry is set (7 days from now)
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(decoded.payload.exp).toBeGreaterThan(now);
      expect(decoded.payload.exp).toBeLessThanOrEqual(now + sevenDaysInSeconds + 5); // +5 for test execution time
    });

    it('should use custom expiresIn when provided', () => {
      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '1h',
      };

      const token = generateToken(testPayload, config);
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded).toBeDefined();

      // Verify expiry is set (1 hour from now)
      const now = Math.floor(Date.now() / 1000);
      const oneHourInSeconds = 60 * 60;
      expect(decoded.payload.exp).toBeGreaterThan(now);
      expect(decoded.payload.exp).toBeLessThanOrEqual(now + oneHourInSeconds + 5); // +5 for test execution time
    });

    it('should embed correct payload data in the token', () => {
      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      const token = generateToken(testPayload, config);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should generate verifiable token with correct secret', () => {
      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      const token = generateToken(testPayload, config);

      // Should not throw when verifying with same secret
      expect(() => {
        jwt.verify(token, testSecret);
      }).not.toThrow();
    });

    it('should generate different tokens for different payloads', () => {
      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      const payload1: JwtPayload = {
        userId: 'user-123',
        email: 'test1@example.com',
      };

      const payload2: JwtPayload = {
        userId: 'user-456',
        email: 'test2@example.com',
      };

      const token1 = generateToken(payload1, config);
      const token2 = generateToken(payload2, config);

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens with different secrets', () => {
      const config1: JwtConfig = {
        secret: 'secret-1',
        expiresIn: '7d',
      };

      const config2: JwtConfig = {
        secret: 'secret-2',
        expiresIn: '7d',
      };

      const token1 = generateToken(testPayload, config1);
      const token2 = generateToken(testPayload, config2);

      expect(token1).not.toBe(token2);
    });
  });
});
