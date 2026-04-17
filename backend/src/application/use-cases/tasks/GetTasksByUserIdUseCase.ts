import { Task } from '../../../domain/entities/Task';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { validateRequiredString } from '../../../shared/utils/validators';

export class GetTasksByUserIdUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(userId: string): Promise<Task[]> {
    validateRequiredString(userId, 'userId');
    return this.taskRepository.findByUserId(userId);
  }
}
