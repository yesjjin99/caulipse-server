import { Router } from 'express';
import commentRouter from './comment';
import idRouter from './studyid';

const router = Router();
router.use('/comment', commentRouter);
router.use('/:studyid', idRouter);

export default router;
