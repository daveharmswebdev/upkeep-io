import jwt from 'jsonwebtoken';
import { verifyToken } from './verify';
import { JwtPayload } from './types';

describe('verifyToken', () => {
  const testSecret = 'test-secret-key';
  const testPayload: JwtPayload = {
    userId: 'user-123',
    email: 'test@example.com',
  };

  const generateTestToken = (payload: JwtPayload, secret: string, expiresIn: string = '7d'): string => {
    return jwt.sign(payload, secret, { expiresIn } as any);
  };

  describe('successful verification', () => {
    it('should verify and return payload for valid token', () => {
      const token = generateTestToken(testPayload, testSecret);

      const result = verifyToken(token, testSecret);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testPayload.userId);
      expect(result.email).toBe(testPayload.email);
    });

    it('should extract correct payload data from token', () => {
      const customPayload: JwtPayload = {
        userId: 'user-456',
        email: 'custom@example.com',
      };

      const token = generateTestToken(customPayload, testSecret);
      const result = verifyToken(token, testSecret);

      expect(result.userId).toBe('user-456');
      expect(result.email).toBe('custom@example.com');
    });
  });

  describe('error handling', () => {
    it('should throw error with message "Invalid or expired token" for invalid token', () => {
      const invalidToken = 'this-is-not-a-valid-jwt-token';

      expect(() => {
        verifyToken(invalidToken, testSecret);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error with message "Invalid or expired token" for malformed token', () => {
      const malformedToken = 'header.payload'; // Missing signature

      expect(() => {
        verifyToken(malformedToken, testSecret);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error with message "Invalid or expired token" for expired token', () => {
      // Create token that expires in 1 millisecond
      const expiredToken = jwt.sign(testPayload, testSecret, { expiresIn: '1ms' });

      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(expiredToken, testSecret);
          }).toThrow('Invalid or expired token');
          resolve(undefined);
        }, 10); // Wait 10ms to ensure expiration
      });
    });

    it('should throw error with message "Invalid or expired token" for wrong secret', () => {
      const token = generateTestToken(testPayload, testSecret);
      const wrongSecret = 'wrong-secret-key';

      expect(() => {
        verifyToken(token, wrongSecret);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token string', () => {
      expect(() => {
        verifyToken('', testSecret);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for token with tampered payload', () => {
      const token = generateTestToken(testPayload, testSecret);

      // Tamper with the payload part (middle section of JWT)
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'hacker', email: 'hacker@evil.com' }))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      expect(() => {
        verifyToken(tamperedToken, testSecret);
      }).toThrow('Invalid or expired token');
    });
  });

  describe('edge cases', () => {
    it('should handle tokens with special characters in payload', () => {
      const specialPayload: JwtPayload = {
        userId: 'user-123-!@#$%',
        email: 'test+special@example.com',
      };

      const token = generateTestToken(specialPayload, testSecret);
      const result = verifyToken(token, testSecret);

      expect(result.userId).toBe(specialPayload.userId);
      expect(result.email).toBe(specialPayload.email);
    });

    it('should handle secrets with special characters', () => {
      const specialSecret = 'secret!@#$%^&*()_+-=[]{}|;:,.<>?';
      const token = generateTestToken(testPayload, specialSecret);
      const result = verifyToken(token, specialSecret);

      expect(result.userId).toBe(testPayload.userId);
      expect(result.email).toBe(testPayload.email);
    });
  });
});
