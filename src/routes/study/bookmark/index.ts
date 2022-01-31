import { Router } from 'express';
import helloWorld from '../../hello-world';
import controller from './bookmark.controller';

const router = Router({ mergeParams: true });

router.patch('/', controller.createBookmark);
router.delete('/', helloWorld);

export default router;
