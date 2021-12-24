import { Router } from 'express';
import helloWorld from '../../hello-world';
import notificationRouter from './notification';
import categoryRouter from './category';

const router = Router();
router.patch('/', helloWorld);
router.delete('/', helloWorld);
router.use('/notification', notificationRouter);
router.use('/category', categoryRouter);

export default router;
