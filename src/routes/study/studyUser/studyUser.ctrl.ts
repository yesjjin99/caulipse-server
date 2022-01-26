import { Request, Response } from 'express';
import {
  findAllByStudyId,
  saveStudyUserRecord,
} from '../../../services/studyUser';
import studyService from '../../../services/study';

export default {
  async getStudyUserList(req: Request, res: Response) {
    const NOT_FOUND = '일치하는 studyid 가 없음';
    const FORBIDDEN = '사용자 권한 부족';

    let study;
    try {
      study = await studyService.findById(req.params.studyid);
    } catch (e) {
      res.status(404).json({ message: NOT_FOUND });
      return;
    }

    try {
      const userId = (req.user as { id: string }).id;
      const hasAuthority = study?.HOST_ID === userId;
      if (!hasAuthority) throw new Error(FORBIDDEN);
    } catch (e) {
      res.status(403).json({ message: FORBIDDEN });
      return;
    }

    try {
      const result = await findAllByStudyId(req.params.studyid);
      res.json(
        result.map((record: any) => ({
          studyId: record.StudyUser_STUDY_ID,
          userId: record.StudyUser_USER_ID,
          isAccepted: record.StudyUser_IS_ACCEPTED,
          tempBio: record.StudyUser_TEMP_BIO,
        }))
      );
    } catch (e) {
      res.status(400).json({ message: '올바르지 않은 요청' });
    }
  },
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
      if ((e as Error).message === BAD_REQUEST) {
        res.status(400).json({ message: BAD_REQUEST });
      } else {
        res.status(404).json({ message: NOT_FOUND });
      }
    }
  },
};
