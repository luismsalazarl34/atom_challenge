import { Response, NextFunction } from 'express';
import { GetTasksByUserIdUseCase } from '../../application/use-cases/tasks/GetTasksByUserIdUseCase';
import { CreateTaskUseCase } from '../../application/use-cases/tasks/CreateTaskUseCase';
import { UpdateTaskUseCase } from '../../application/use-cases/tasks/UpdateTaskUseCase';
import { DeleteTaskUseCase } from '../../application/use-cases/tasks/DeleteTaskUseCase';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../../shared/errors/AppError';

export class TaskController {
  constructor(
    private readonly getTasksByUserId: GetTasksByUserIdUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const tasks = await this.getTasksByUserId.execute(userId);
      res.json({ tasks });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const { title, description } = req.body as { title: string; description: string };
      const task = await this.createTask.execute({ title, description, userId });
      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = this.extractUserId(req);
      const { title, description, completed } = req.body as {
        title?: string;
        description?: string;
        completed?: boolean;
      };
      const task = await this.updateTask.execute(id, userId, { title, description, completed });
      res.json({ task });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = this.extractUserId(req);
      await this.deleteTask.execute(id, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  private extractUserId(req: AuthRequest): string {
    if (!req.user?.userId) throw new AppError('Unauthorized', 401);
    return req.user.userId;
  }
}
