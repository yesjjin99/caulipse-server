import { Router } from 'express';
import helloWorld from '../../hello-world';
import controller from './bookmark.controller';

const router = Router({ mergeParams: true });

router.post('/', controller.registerBookmark);
router.delete('/', helloWorld);

export default router;
