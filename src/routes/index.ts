import { Router } from 'express';
import userRouter from './user';
import studyRouter from './study';

const router = Router();
router.use('/api/user', userRouter);
router.use('/api/study', studyRouter);

export default router;
