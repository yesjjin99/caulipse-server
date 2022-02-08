import { Router } from 'express';
import helloWorld from '../../hello-world';
import { registerBookmark } from './bookmark.controller';

const router = Router({ mergeParams: true });

router.post('/', registerBookmark);
router.delete('/', helloWorld);

export default router;
