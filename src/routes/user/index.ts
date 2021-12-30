import { Router } from 'express';
import helloWorld from '../hello-world';
import userIdRouter from './userid';
import roleRouter from './role';
import profileRouter from './profile';
import { saveUser } from '../../services/User';

const router = Router();
router.post('/', helloWorld);
router.use('/:id', userIdRouter);
router.use('/role', roleRouter);
router.use('/profile', profileRouter);

export default router;
