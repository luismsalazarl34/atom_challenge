import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../../infrastructure/services/JwtService';
import { AppError } from '../../shared/errors/AppError';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function createAuthMiddleware(jwtService: JwtService) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Missing or invalid Authorization header', 401));
    }

    const token = authHeader.slice(7);
    try {
      req.user = jwtService.verify(token);
      next();
    } catch {
      next(new AppError('Invalid or expired token', 401));
    }
  };
}
