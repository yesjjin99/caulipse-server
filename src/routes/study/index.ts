import { Router } from 'express';
import studyUserRouter from './studyUser';
import bookmarkRouter from './bookmark';
import commentRouter from './comment';
import { checkToken } from '../../middlewares/auth';
import controller from './study.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getAllStudy);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.post('/', controller.createStudy);

router.get('/:studyid', controller.getStudybyId);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.patch('/:studyid', controller.updateStudy);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.delete('/:studyid', controller.deleteStudy);

// 스터디 참가 신청 라우터
router.use('/user/:studyid', checkToken, studyUserRouter);
// 스터디 북마크 라우터
router.use('/:studyid/bookmark', bookmarkRouter);
// 스터디 문의글 라우터
router.use('/:studyid/comment', commentRouter);

export default router;
