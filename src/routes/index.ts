import { Router } from 'express';
import userRouter from './user';
import studyRouter from './study';
import noticeRouter from './notice';
import studyController from './study/study.controller';

const router = Router();
router.use('/api/user', userRouter);
router.use('/api/study', studyRouter);
router.use('/api/notice', noticeRouter);

// 검색
router.get('/api/search', studyController.searchStudy);

export default router;
