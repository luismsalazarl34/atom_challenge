import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = '7d') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
