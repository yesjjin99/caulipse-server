import { Router } from 'express';
import helloWorld from '../../hello-world';
import metooRouter from './metoo';

const router = Router({ mergeParams: true });

router.get('/', helloWorld);
router.post('/', helloWorld);

router.patch('/:commentid', helloWorld);
router.delete('/:commentid', helloWorld);

router.use('/:commentid/metoo', metooRouter);

export default router;
