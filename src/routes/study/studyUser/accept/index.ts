import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router({ mergeParams: true });

router.patch('/', helloWorld);

export default router;
