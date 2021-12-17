import { Router } from 'express';
import studyCommentRouter from './comment';

const router = Router();
router.use('/comment', studyCommentRouter);

export default router;
