export interface TokenPayload {
  userId: string;
  email: string;
}

export interface ITokenGenerator {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
