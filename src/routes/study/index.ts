import { Router } from 'express';
import studyIdRouter from './studyid';
import commentRouter from './comment';
import detailRouter from './detail';
import userRouter from './user';
import { getAllStudy, createStudy } from '../../services/study';

const router = Router();
router.get('/', getAllStudy);
router.post('/', createStudy);

router.use('/:studyid', studyIdRouter);
router.use('/comment', commentRouter);
router.use('/detail', detailRouter);
router.use('/user', userRouter);

export default router;
