import jwt from 'jsonwebtoken';
import { JwtPayload, JwtConfig } from './types';

export function generateToken(payload: JwtPayload, config: JwtConfig): string {
  const expiresIn = config.expiresIn || '7d';
  return jwt.sign(payload, config.secret, { expiresIn } as any);
}
