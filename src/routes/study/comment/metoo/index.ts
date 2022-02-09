import { Router } from 'express';
import { checkToken } from '../../../../middlewares/auth';
import controller from './metoo.controller';

const router = Router({ mergeParams: true });

router.get('/', controller.getMetooCount);
router.post('/', checkToken, controller.registerMetoo);
router.delete('/', checkToken, controller.deleteMetoo);

export default router;
