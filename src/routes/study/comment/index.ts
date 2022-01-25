import { Router } from 'express';
import helloWorld from '../../hello-world';
import metooRouter from './metoo';
import controller from './comment.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getComment);
// FIX: 액세스 토큰 검증 미들웨어 추가
router.post('/', controller.createComment);

router.patch('/:commentid', helloWorld);
router.delete('/:commentid', helloWorld);

router.use('/:commentid/metoo', metooRouter);

export default router;
