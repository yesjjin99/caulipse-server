import { Router } from 'express';
import helloWorld from '../../hello-world';

const router = Router();
router.get('/', helloWorld);
router.patch('/', helloWorld);
router.delete('/', helloWorld);

export default router;
