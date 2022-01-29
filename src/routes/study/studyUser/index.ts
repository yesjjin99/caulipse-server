import { Router } from 'express';
import helloWorld from '../../hello-world';
import controller from './studyUser.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getStudyUserList);
router.post('/', controller.joinStudy);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

router.patch('/accept', controller.acceptUser);

export default router;
