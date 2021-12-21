import { Router } from 'express';
import helloWorld from '../hello-world';
import idRouter from './id';
import studyIdRouter from './studyid';
import commentRouter from './comment';
import detailRouter from './detail';
import userRouter from './user';

const router = Router();
router.get('/', helloWorld);
router.post('/', helloWorld);
router.use('/:id', idRouter); // FIXME: id 디렉토리를 studyid 디렉토리로 수정
router.use('/:studyid', studyIdRouter);
router.use('/comment', commentRouter);
router.use('/detail', detailRouter);
router.use('/user', userRouter);

export default router;
