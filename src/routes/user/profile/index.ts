import { Router } from 'express';
import { checkToken } from '../../../middlewares/auth';
import {
  createProfile,
  getUserProfileById,
} from '../../../services/user/profile';
import helloWorld from '../../hello-world';

const router = Router();

// 프로필 설정 페이지
router.post('/', checkToken, createProfile);
// 사용자 프로필 정보 조회
router.get('/:id', checkToken, getUserProfileById);
// 사용자 프로필 갱신
router.patch('/:id', helloWorld);

export default router;
