import { Router } from 'express';
import studyCommentRouter from './comment';
import studyBookmarkRouter from './bookmark';

const router = Router();
router.use('/comment', studyCommentRouter);
router.use('/bookmark', studyBookmarkRouter);

export default router;
