import { Router } from 'express';
import controller from './bookmark.controller';

const router = Router({ mergeParams: true });

router.post('/', controller.registerBookmark);
router.delete('/', controller.deleteBookmark);

export default router;
