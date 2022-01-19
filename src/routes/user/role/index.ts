import { Router } from 'express';
import controller from './role.controller';

const router = Router({ mergeParams: true });
router.patch('/', controller.changeUserRole);

export default router;
