import express from 'express';
import cors from 'cors';

import { FirestoreUserRepository } from './infrastructure/database/FirestoreUserRepository';
import { FirestoreTaskRepository } from './infrastructure/database/FirestoreTaskRepository';
import { JwtService } from './infrastructure/services/JwtService';

import { GetUserByEmailUseCase } from './application/use-cases/users/GetUserByEmailUseCase';
import { CreateUserUseCase } from './application/use-cases/users/CreateUserUseCase';
import { GetTasksByUserIdUseCase } from './application/use-cases/tasks/GetTasksByUserIdUseCase';
import { CreateTaskUseCase } from './application/use-cases/tasks/CreateTaskUseCase';
import { UpdateTaskUseCase } from './application/use-cases/tasks/UpdateTaskUseCase';
import { DeleteTaskUseCase } from './application/use-cases/tasks/DeleteTaskUseCase';

import { UserController } from './interfaces/controllers/UserController';
import { TaskController } from './interfaces/controllers/TaskController';
import { createUserRouter } from './interfaces/routes/userRoutes';
import { createTaskRouter } from './interfaces/routes/taskRoutes';
import { errorMiddleware } from './interfaces/middleware/errorMiddleware';

export function createApp(jwtSecret: string): express.Application {
  const app = express();

  app.use(cors({
    origin: [
      'https://atom-challenge-fullstack.web.app',
      'https://atom-challenge-fullstack.firebaseapp.com',
      'http://localhost:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10kb' }));

  // Services
  const jwtService = new JwtService(jwtSecret);

  // Repositories
  const userRepository = new FirestoreUserRepository();
  const taskRepository = new FirestoreTaskRepository();

  // Use cases
  const getUserByEmail = new GetUserByEmailUseCase(userRepository);
  const createUser = new CreateUserUseCase(userRepository);
  const getTasksByUserId = new GetTasksByUserIdUseCase(taskRepository);
  const createTask = new CreateTaskUseCase(taskRepository);
  const updateTask = new UpdateTaskUseCase(taskRepository);
  const deleteTask = new DeleteTaskUseCase(taskRepository);

  // Controllers
  const userController = new UserController(getUserByEmail, createUser, jwtService);
  const taskController = new TaskController(getTasksByUserId, createTask, updateTask, deleteTask);

  // Routes
  app.use('/users', createUserRouter(userController));
  app.use('/tasks', createTaskRouter(taskController, jwtService));

  app.use(errorMiddleware);

  return app;
}
