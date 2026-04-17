import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { JwtService } from '../../infrastructure/services/JwtService';

export function createTaskRouter(controller: TaskController, jwtService: JwtService): Router {
  const router = Router();
  const auth = createAuthMiddleware(jwtService);

  router.use(auth);
  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
