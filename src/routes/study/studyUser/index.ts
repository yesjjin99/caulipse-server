import { Router } from 'express';
import controller from './studyUser.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getStudyUserList);
router.post('/', controller.joinStudy);
router.patch('/', controller.updateStudyJoin);
router.delete('/', controller.deleteStudyJoin);

router.patch('/accept', controller.acceptUser);

export default router;
