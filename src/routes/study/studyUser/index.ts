import { Router } from 'express';
import helloWorld from '../../hello-world';
import acceptRouter from './accept';

const router = Router({ mergeParams: true });

router.get('/', helloWorld);
router.post('/', helloWorld);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

router.use('/accept', acceptRouter);

export default router;
