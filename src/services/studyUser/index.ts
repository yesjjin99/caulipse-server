import { getConnection, getRepository } from 'typeorm';
import StudyUser from '../../entity/StudyUserEntity';

interface SaveStudyUserRecordDTO {
  userId: string;
  studyId: string;
  tempBio: string;
}

export const saveStudyUserRecord = async ({
  userId,
  studyId,
  tempBio,
}: SaveStudyUserRecordDTO) => {
  await getRepository(StudyUser)
    .createQueryBuilder()
    .insert()
    .values({
      USER_ID: userId,
      STUDY_ID: studyId,
      isAccepted: false,
      tempBio,
    })
    .execute();
};

export const findAllByStudyId = async (studyId: string) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .select()
    .where('STUDY_ID = :id', { id: studyId })
    .execute();
};

export const findAllIfParticipatedByUserId = async (userId: string) => {
  return await getConnection()
    .createQueryRunner()
    .query(
      'SELECT STUDY.ID, STUDY.TITLE, STUDY.CREATED_AT, STUDY.VIEWS, STUDY.BOOKMARK_COUNT FROM STUDY \
        JOIN STUDY_USER ON \
        STUDY_USER.STUDY_ID = STUDY.ID \
        WHERE STUDY_USER.USER_ID = ? \
        ORDER BY STUDY.CREATED_AT',
      [userId]
    );
};

/**
 * 참가신청이 수락된 사용자 목록 조회(참여자 조회)
 */
export const findAcceptedByStudyId = async (studyId: string) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .select()
    .where('STUDY_ID = :id', { id: studyId })
    .andWhere('IS_ACCEPTED = 1')
    .execute();
};

/**
 * 참가신청이 수락대기중인 사용자 목록 조회
 */
export const findNotAcceptedApplicantsByStudyId = async (studyId: string) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .select()
    .where('STUDY_ID = :id', { id: studyId })
    .andWhere('IS_ACCEPTED = 0')
    .execute();
};

export const updateAcceptStatus = async (
  studyId: string,
  userId: string,
  accept = true
) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .update()
    .set({ isAccepted: accept })
    .where('STUDY_ID = :id', { id: studyId })
    .andWhere('USER_ID = :userid', { userid: userId })
    .execute();
};

export const updateUserTempBio = async (
  studyId: string,
  userId: string,
  tempBio: string
) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .update()
    .set({ tempBio })
    .where('STUDY_ID = :id', { id: studyId })
    .andWhere('USER_ID = :userid', { userid: userId })
    .execute();
};

export const deleteByStudyAndUserId = async (
  studyId: string,
  userId: string
) => {
  return await getRepository(StudyUser)
    .createQueryBuilder()
    .delete()
    .where('STUDY_ID = :id', { id: studyId })
    .andWhere('USER_ID = :userid', { userid: userId })
    .execute();
};
