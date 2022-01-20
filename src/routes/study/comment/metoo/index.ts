import { Router } from 'express';
import helloWorld from '../../../hello-world';

const router = Router({ mergeParams: true });

router.get('/', helloWorld);
router.post('/', helloWorld);
router.delete('/', helloWorld);

export default router;
