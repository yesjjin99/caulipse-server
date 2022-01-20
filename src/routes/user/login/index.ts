import { Router } from 'express';
import controller from './login.controller';

const router = Router();
router.post('/', controller.login);

export default router;
