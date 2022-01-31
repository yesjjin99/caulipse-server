import { Router } from 'express';
import helloWorld from '../../hello-world';
import acceptRouter from './accept';
import controller from './studyUser.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getStudyUserList);
router.post('/', controller.joinStudy);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

router.use('/accept', acceptRouter);

export default router;
