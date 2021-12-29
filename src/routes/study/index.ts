import { Router } from 'express';
import helloWorld from '../hello-world';
import studyIdRouter from './studyid';
import commentRouter from './comment';
import detailRouter from './detail';
import userRouter from './user';
import { registerStudy } from '../../services/study';

const router = Router();
router.get('/', helloWorld);
router.post('/', registerStudy);
router.use('/:studyid', studyIdRouter);
router.use('/comment', commentRouter);
router.use('/detail', detailRouter);
router.use('/user', userRouter);

export default router;
