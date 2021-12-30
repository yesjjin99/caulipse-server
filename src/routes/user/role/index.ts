import { Router } from 'express';
import { changeUserRole } from '../../../services/User';

const router = Router();
router.patch('/:id', changeUserRole);

export default router;
