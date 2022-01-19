import { Router } from 'express';
import profileRouter from './profile';
import loginRouter from './login';
import roleRouter from './role';
import notificationRouter from './notification';
import categoryRouter from './category';
import { saveUser } from '../../services/User';
import helloWorld from '../hello-world';

const router = Router();
router.post('/', saveUser);
router.patch('/', helloWorld);
router.delete('/', helloWorld);
router.use('/:id/role', roleRouter);
router.use('/:id/notification', notificationRouter);
router.use('/:id/category', categoryRouter);

router.use('/profile', profileRouter);
router.use('/login', loginRouter);

export default router;
