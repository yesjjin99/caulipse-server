import { Request, Response, NextFunction, Router } from 'express';
import userIdRouter from './userid';
import profileRouter from './profile';
import loginRouter from './login';
import { saveUser } from '../../services/user';

const router = Router();
router.post('/', saveUser);
router.use(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    req.user = {
      id: req.params.id,
    };
    next();
  },
  userIdRouter
);
router.use('/profile', profileRouter);
router.use('/login', loginRouter);

export default router;
