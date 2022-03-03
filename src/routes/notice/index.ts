import { Router } from 'express';
import { checkToken } from '../../middlewares/auth';
import controller from './notice.controller';

const router = Router();
router.get('/', controller.findAllNotice);
router.post('/', checkToken, controller.createNotice);

router.get('/:notiid', controller.findNoticeById);
router.patch('/:notiid', checkToken, controller.updateNoticeById);
router.delete('/:notiid', checkToken, controller.deleteNotice);

export default router;
