import { Router } from 'express';
import { changeUserRole } from '../../../../services/user';

const router = Router();
router.patch('/', changeUserRole);

export default router;
