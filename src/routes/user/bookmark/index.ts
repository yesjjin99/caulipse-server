import { Router } from 'express';
import { getBookmarksByUser } from './bookmark.controller';

const router = Router();
// 사용자의 북마크 목록 조회
router.get('/', getBookmarksByUser);

export default router;
