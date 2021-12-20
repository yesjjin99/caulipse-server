import { Router } from 'express';
import idRouter from './id';
import acceptRouter from './accept';

const router = Router();
router.use('/:id', idRouter);
router.use('/accept', acceptRouter);

export default router;
