import { Router } from 'express';
import { checkToken } from '../../../middlewares/auth';
import controller from './studyUser.controller';

const router = Router({ mergeParams: true });

router.get('/', checkToken, controller.getStudyUserList);
router.post('/', checkToken, controller.joinStudy);
router.patch('/', checkToken, controller.updateStudyJoin);
router.delete('/', checkToken, controller.deleteStudyJoin);

router.get('/participants', controller.getStudyParticipants);
router.patch('/accept', checkToken, controller.acceptUser);

export default router;
