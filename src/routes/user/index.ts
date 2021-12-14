import { Router } from 'express';
import helloWorld from '../hello-world';
import idRouter from './id';
import roleRouter from './role';
import profileRouter from './profile';

const router = Router();
router.post('/', helloWorld);
router.use('/:id', idRouter);
router.use('/role', roleRouter);
router.use('/profile', profileRouter);

export default router;
