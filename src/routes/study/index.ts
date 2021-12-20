import { Router } from 'express';
import helloWorld from '../hello-world';
import idRouter from './id';
import detailRouter from './detail';
import userRouter from './user';

const router = Router();
router.get('/', helloWorld);
router.post('/', helloWorld);
router.use('/:id', idRouter);
router.use('/detail', detailRouter);
router.use('/user', userRouter);

export default router;
