import { Router } from 'express';
import userRouter from './user';
import studyRouter from './study';
import noticeRouter from './notice';

const router = Router();
router.use('/api/user', userRouter);
router.use('/api/study', studyRouter);
router.use('/api/notice', noticeRouter);

export default router;
