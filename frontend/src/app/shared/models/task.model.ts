export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
  userId: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}
