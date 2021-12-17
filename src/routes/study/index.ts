import { Router } from 'express';
import commentRouter from './comment';
import idRouter from './id';

const router = Router();
router.use('/comment', commentRouter);
router.use('/:id', idRouter);

export default router;
