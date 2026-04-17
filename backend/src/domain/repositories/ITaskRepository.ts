import { Task } from '../entities/Task';

export interface ITaskRepository {
  findByUserId(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  update(id: string, data: Partial<Pick<Task, 'title' | 'description' | 'completed'>>): Promise<Task>;
  delete(id: string): Promise<void>;
}
