import { Router } from 'express';
import helloWorld from './hello-world';
import userRouter from './user';
import studyRouter from './study';

const router = Router();
router.use('/api/user', userRouter);
router.use('/api/study', studyRouter);
// 메인 페이지
router.get('/api/', helloWorld);

export default router;
