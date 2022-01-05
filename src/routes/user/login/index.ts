import { Router } from 'express';
import { login } from '../../../services/User';

const router = Router();
router.post('/', login);

export default router;
