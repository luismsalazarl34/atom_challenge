import { Task } from '../../../domain/entities/Task';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { validateRequiredString } from '../../../shared/utils/validators';

export interface CreateTaskDto {
  title: string;
  description: string;
  userId: string;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const title = validateRequiredString(dto.title, 'title');
    const description = validateRequiredString(dto.description, 'description');
    const userId = validateRequiredString(dto.userId, 'userId');

    return this.taskRepository.create({ title, description, userId, completed: false });
  }
}
