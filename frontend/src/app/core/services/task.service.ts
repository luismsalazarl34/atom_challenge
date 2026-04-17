import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private readonly api: ApiService) {}

  getTasks(): Observable<Task[]> {
    return this.api.get<{ tasks: Task[] }>('/tasks').pipe(map((res) => res.tasks));
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.api.post<{ task: Task }>('/tasks', dto).pipe(map((res) => res.task));
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.api.put<{ task: Task }>(`/tasks/${id}`, dto).pipe(map((res) => res.task));
  }

  deleteTask(id: string): Observable<void> {
    return this.api.delete<void>(`/tasks/${id}`);
  }

  toggleComplete(task: Task): Observable<Task> {
    return this.updateTask(task.id, { completed: !task.completed });
  }
}
