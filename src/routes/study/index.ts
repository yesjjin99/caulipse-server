import { Router } from 'express';
import studyUserRouter from './studyUser';
import bookmarkRouter from './bookmark';
import commentRouter from './comment';
import {
  getAllStudy,
  createStudy,
  getStudybyId,
  updateStudy,
  deleteStudy,
} from './study.ctrl';

const router = Router({ mergeParams: true });

router.get('/', getAllStudy);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.post('/', createStudy);

router.get('/:studyid', getStudybyId);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.patch('/:studyid', updateStudy);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.delete('/:studyid', deleteStudy);

// 스터디 참가 신청 라우터
router.use('/user/:studyid', studyUserRouter);
// 스터디 북마크 라우터
// TODO: 사용자의 북마크 목록 조회 엔드포인트 추가 (user 라우터)
router.use('/:studyid/bookmark', bookmarkRouter);
// 스터디 문의글 라우터
router.use('/:studyid/comment', commentRouter);

export default router;
