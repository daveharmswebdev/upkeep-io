export interface JwtPayload {
  userId: string;
  email: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn?: string;
}
