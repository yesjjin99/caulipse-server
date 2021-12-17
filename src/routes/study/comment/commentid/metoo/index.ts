import { Router } from 'express';
import helloWorld from '../../../../hello-world';

const router = Router();
// 해당 댓글의 나도 궁금해요 카운트
router.get('/', helloWorld);
// 해당 댓글에 나도 궁금해요 추가
router.post('/', helloWorld);
// 해당 댓글에 해당 유저의 나도 궁금해요 해제
router.delete('/:userId', helloWorld);

export default router;
