import { Router } from 'express';
import helloWorld from '../../hello-world';
import notificationRouter from './notification';

const router = Router();
router.patch('/', helloWorld);
router.delete('/', helloWorld);
router.use('/notification', notificationRouter);

export default router;
