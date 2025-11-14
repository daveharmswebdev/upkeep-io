import { injectable } from 'inversify';
import { ITokenGenerator, TokenPayload } from '../../domain/services';
import { generateToken, verifyToken } from '@auth/jwt';

@injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-change-this';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  generate(payload: TokenPayload): string {
    return generateToken(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): TokenPayload {
    return verifyToken(token, this.secret);
  }
}
