import { Router } from 'express';
import helloWorld from '../hello-world';
import controller from './notice.controller';

const router = Router();
router.get('/', controller.findAllNotice);
router.post('/', helloWorld);

router.get('/:notiid', helloWorld);
router.patch('/:notiid', helloWorld);
router.delete('/:notiid', helloWorld);

export default router;
