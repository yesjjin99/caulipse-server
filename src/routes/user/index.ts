import { Router } from 'express';
import profileRouter from './profile';
import loginRouter from './login';
import roleRouter from './role';
import notificationRouter from './notification';
import categoryRouter from './category';
import controller from './user.ctrl';
import { checkToken } from '../../middlewares/auth';

const router = Router();
router.use('/notification', checkToken, notificationRouter);
router.use('/category', categoryRouter);
router.use('/profile', profileRouter);
router.use('/login', loginRouter);

router.post('/', controller.saveUser);
router.delete('/', checkToken, controller.deleteUser);
router.use('/:id/role', roleRouter);
router.patch('/:id', controller.updateUserInfo);

export default router;
