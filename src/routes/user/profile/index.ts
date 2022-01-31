import { Router } from 'express';
import {
  createProfile,
  getUserProfileById,
} from '../../../services/user/profile';
import helloWorld from '../../hello-world';

const router = Router();

// 사용자 프로필 정보 조회
router.get('/:id', getUserProfileById);
// 프로필 설정 페이지
router.post('/', createProfile);
// 사용자 프로필 갱신
router.patch('/:id', helloWorld);

export default router;
