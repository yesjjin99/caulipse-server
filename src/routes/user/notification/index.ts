import { Router } from 'express';
import controller from './notification.controller';

const router = Router({ mergeParams: true });
router.get('/', controller.findAllNotification);
// 사용자의 알림 확인 상태 갱신
router.patch('/:notiId', controller.updateReadstatus);
// 사용자의 알림 항목을 삭제
router.delete('/:notiId', controller.deleteNotification);

export default router;
