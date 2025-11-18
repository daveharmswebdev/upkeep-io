import { generateToken } from './generate';
import { verifyToken } from './verify';
import { JwtPayload, JwtConfig } from './types';

describe('JWT Integration Tests', () => {
  const testSecret = 'integration-test-secret';

  describe('generateToken -> verifyToken round-trip', () => {
    it('should successfully verify a generated token', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      // Generate token
      const token = generateToken(payload, config);

      // Verify token
      const decoded = verifyToken(token, testSecret);

      // Assert payload survived round-trip
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should preserve all payload data through round-trip', () => {
      const payload: JwtPayload = {
        userId: 'user-456',
        email: 'roundtrip@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '1h',
      };

      const token = generateToken(payload, config);
      const decoded = verifyToken(token, testSecret);

      // Verify exact data preservation
      expect(decoded).toMatchObject({
        userId: payload.userId,
        email: payload.email,
      });
    });

    it('should handle multiple tokens with same secret', () => {
      const payload1: JwtPayload = {
        userId: 'user-1',
        email: 'user1@example.com',
      };

      const payload2: JwtPayload = {
        userId: 'user-2',
        email: 'user2@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      // Generate two tokens
      const token1 = generateToken(payload1, config);
      const token2 = generateToken(payload2, config);

      // Verify both tokens
      const decoded1 = verifyToken(token1, testSecret);
      const decoded2 = verifyToken(token2, testSecret);

      // Each should have correct data
      expect(decoded1.userId).toBe(payload1.userId);
      expect(decoded1.email).toBe(payload1.email);
      expect(decoded2.userId).toBe(payload2.userId);
      expect(decoded2.email).toBe(payload2.email);
    });

    it('should fail verification when using different secret', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const config: JwtConfig = {
        secret: 'secret-1',
        expiresIn: '7d',
      };

      // Generate with one secret
      const token = generateToken(payload, config);

      // Try to verify with different secret
      expect(() => {
        verifyToken(token, 'secret-2');
      }).toThrow('Invalid or expired token');
    });

    it('should handle tokens with default expiration', () => {
      const payload: JwtPayload = {
        userId: 'user-789',
        email: 'default@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        // No expiresIn provided - should default to '7d'
      };

      const token = generateToken(payload, config);
      const decoded = verifyToken(token, testSecret);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should handle tokens with custom short expiration', () => {
      const payload: JwtPayload = {
        userId: 'user-short',
        email: 'short@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '5s', // 5 seconds
      };

      const token = generateToken(payload, config);
      const decoded = verifyToken(token, testSecret);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should handle special characters in payload data', () => {
      const payload: JwtPayload = {
        userId: 'user-!@#$%^&*()',
        email: 'test+special@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '1d',
      };

      const token = generateToken(payload, config);
      const decoded = verifyToken(token, testSecret);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should handle long secret strings', () => {
      const longSecret = 'a'.repeat(256); // 256 character secret
      const payload: JwtPayload = {
        userId: 'user-long-secret',
        email: 'longsecret@example.com',
      };

      const config: JwtConfig = {
        secret: longSecret,
        expiresIn: '1h',
      };

      const token = generateToken(payload, config);
      const decoded = verifyToken(token, longSecret);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('error scenarios in round-trip', () => {
    it('should fail when token is tampered after generation', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '7d',
      };

      const token = generateToken(payload, config);

      // Tamper with token
      const tamperedToken = token + 'tampered';

      expect(() => {
        verifyToken(tamperedToken, testSecret);
      }).toThrow('Invalid or expired token');
    });

    it('should maintain security across different user contexts', () => {
      const adminPayload: JwtPayload = {
        userId: 'admin-001',
        email: 'admin@example.com',
      };

      const userPayload: JwtPayload = {
        userId: 'user-001',
        email: 'user@example.com',
      };

      const config: JwtConfig = {
        secret: testSecret,
        expiresIn: '1d',
      };

      const adminToken = generateToken(adminPayload, config);
      const userToken = generateToken(userPayload, config);

      // Verify tokens are different
      expect(adminToken).not.toBe(userToken);

      // Verify each decodes to correct user
      const decodedAdmin = verifyToken(adminToken, testSecret);
      const decodedUser = verifyToken(userToken, testSecret);

      expect(decodedAdmin.userId).toBe('admin-001');
      expect(decodedUser.userId).toBe('user-001');
    });
  });
});
