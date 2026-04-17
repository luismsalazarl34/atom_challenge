import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    if (task.userId !== userId) {
      throw new AppError('Forbidden', 403);
    }
    await this.taskRepository.delete(id);
  }
}
