import { Router } from 'express';
import { changeUserRole } from '../../../services/User';

const router = Router();
router.patch('/', changeUserRole);

export default router;
