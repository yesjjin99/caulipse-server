import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router();
router.get('/', helloWorld);

export default router;
