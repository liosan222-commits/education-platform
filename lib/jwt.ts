import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
