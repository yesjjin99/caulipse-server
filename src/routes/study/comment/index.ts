import { Router } from 'express';
import commentIdRouter from './commentid';

const router = Router();
router.use('/:id', commentIdRouter);

export default router;
