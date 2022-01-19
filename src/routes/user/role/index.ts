import { Router } from 'express';
import { changeUserRole } from '../../../services/User';

const router = Router({ mergeParams: true });
router.patch('/', changeUserRole);

export default router;
