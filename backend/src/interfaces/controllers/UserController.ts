import { Request, Response, NextFunction } from 'express';
import { GetUserByEmailUseCase } from '../../application/use-cases/users/GetUserByEmailUseCase';
import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase';
import { JwtService } from '../../infrastructure/services/JwtService';

export class UserController {
  constructor(
    private readonly getUserByEmail: GetUserByEmailUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  getByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.query as { email: string };
      const user = await this.getUserByEmail.execute(email);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const token = this.jwtService.sign({ userId: user.id, email: user.email });
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body as { email: string };
      const user = await this.createUser.execute(email);
      const token = this.jwtService.sign({ userId: user.id, email: user.email });
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  };
}
