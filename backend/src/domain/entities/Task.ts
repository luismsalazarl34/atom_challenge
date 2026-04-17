export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  completed: boolean;
  userId: string;
}
