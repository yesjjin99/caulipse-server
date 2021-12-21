import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router();
// 새로운 스터디 북마크 등록
router.post('/', helloWorld);
// 유저의 스터디 북마크 취소
router.delete('/:userId', helloWorld);

export default router;
