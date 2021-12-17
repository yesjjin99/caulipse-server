import { Router } from 'express';
import commentRouter from './comment';

const router = Router();
router.use('/comment', commentRouter);

export default router;
