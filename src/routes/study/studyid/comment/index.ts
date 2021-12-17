import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router();
// 스터디 문의글 목록 조회
router.get('/', helloWorld);
// 새로운 스터디 분의글 등록
router.post('/', helloWorld);
// 스터디 문의글 수정
router.patch('/:commentId', helloWorld);
// 스터디 문의글 삭제
router.delete('/:commentId', helloWorld);

export default router;
