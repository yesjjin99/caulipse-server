import { Router } from 'express';
import { login } from '../../../services/user';

const router = Router();
router.post('/', login);

export default router;
