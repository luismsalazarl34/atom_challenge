import { Task } from '../../../domain/entities/Task';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../shared/errors/AppError';

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    if (task.userId !== userId) {
      throw new AppError('Forbidden', 403);
    }

    const updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>> = {};
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.completed !== undefined) updates.completed = dto.completed;

    return this.taskRepository.update(id, updates);
  }
}
