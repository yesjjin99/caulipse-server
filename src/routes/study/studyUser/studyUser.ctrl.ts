import { Request, Response } from 'express';
import { saveStudyUserRecord } from '../../../services/studyUser';

export default {
  async joinStudy(req: Request, res: Response) {
    const OK = '참가신청 성공';
    const BAD_REQUEST = '잘못된 요창';
    const NOT_FOUND = '일치하는 study id 가 없음';

    try {
      const { tempBio } = req.body;
      if (!tempBio) throw new Error(BAD_REQUEST);

      await saveStudyUserRecord({
        userId: (req.user as { id: string }).id,
        studyId: req.params.studyid,
        tempBio,
      });
      res.status(201).json({ message: OK });
    } catch (e) {
      if ((e as Error).message === NOT_FOUND) {
        res.status(404).json({ message: NOT_FOUND });
      } else {
        res.status(400).json({ message: BAD_REQUEST });
      }
    }
  },
};
