import { Router } from 'express';
import helloWorld from '../../hello-world';
import acceptRouter from './accept';
import controller from './studyUser.ctrl';

const router = Router({ mergeParams: true });

router.get('/', helloWorld);
router.post('/', controller.joinStudy);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

router.use('/accept', acceptRouter);

export default router;
