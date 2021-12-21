import { Router } from 'express';
import metooCommentRouter from './metoo';

const router = Router();
router.use('/metoo', metooCommentRouter);

export default router;
