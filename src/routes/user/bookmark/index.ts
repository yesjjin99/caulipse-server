import { Router } from 'express';
import helloWorld from '../../hello-world';

const router = Router();
// 사용자의 북마크 목록 조회
router.get('/', helloWorld);

export default router;
