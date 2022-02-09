import { Router } from 'express';
import { checkToken } from '../../../../middlewares/auth';
import helloWorld from '../../../hello-world';
import controller from './metoo.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getMetooCount);
router.post('/', checkToken, controller.registerMetoo);
router.delete('/', helloWorld);

export default router;
