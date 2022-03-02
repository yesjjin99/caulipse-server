import { Router } from 'express';
import controller from './logout.controller';

const router = Router({ mergeParams: true });
router.get('/', controller.handleLogout);

export default router;
