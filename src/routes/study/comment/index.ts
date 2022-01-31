import { Router } from 'express';
import helloWorld from '../../hello-world';
import metooRouter from './metoo';
import controller from './comment.controller';
import { checkToken } from '../../../middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/', controller.getComment);
router.post('/', checkToken, controller.createComment);

router.patch('/:commentid', checkToken, controller.updateComment);
router.delete('/:commentid', helloWorld);

router.use('/:commentid/metoo', metooRouter);

export default router;
