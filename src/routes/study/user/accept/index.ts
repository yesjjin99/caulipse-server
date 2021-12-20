import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router();
router.patch('/:id', helloWorld);

export default router;
