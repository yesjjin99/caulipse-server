import { Router } from 'express';
import helloWorld from '../hello-world';
import idRouter from './id';
import roleRouter from './role';

const router = Router();
router.post('/', helloWorld);
router.use('/:id', idRouter);
router.use('/role', roleRouter);

export default router;
