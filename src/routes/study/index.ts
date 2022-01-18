import { Router, Request, Response, NextFunction } from 'express';
import studyIdRouter from './studyid';
import commentRouter from './comment';
import detailRouter from './detail';
import userRouter from './user';
import { getAllStudy, createStudy } from '../../services/study';
import { checkToken } from '../../middlewares/auth';

const router = Router();
router.get('/', getAllStudy);
router.post('/', checkToken, createStudy);

router.use(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    req.params = {
      id: req.params.id,
    };
    next();
  },
  studyIdRouter
);
router.use('/comment', commentRouter);
router.use('/detail', detailRouter);
router.use('/user', userRouter);

export default router;
