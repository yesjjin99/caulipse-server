import { Router } from 'express';
import { checkToken } from '../../../middlewares/auth';
import controller from './profile.controller';
import {
  createProfile,
  getUserProfileById,
} from '../../../services/user/profile';
import helloWorld from '../../hello-world';

const router = Router();

// 프로필 설정 페이지
router.post('/:id', checkToken, controller.createProfile);
// 사용자 프로필 정보 조회
router.get('/:id', checkToken, controller.getUserProfileById);
// 사용자 프로필 갱신
router.patch('/:id', checkToken, controller.updateUserProfileById);

export default router;
