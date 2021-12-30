import { Router } from 'express';
import studyCommentRouter from './comment';
import studyBookmarkRouter from './bookmark';
import helloWorld from '../../hello-world';

const router = Router();
router.use('/comment', studyCommentRouter);
router.use('/bookmark', studyBookmarkRouter);
router.get('/', helloWorld);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

export default router;
