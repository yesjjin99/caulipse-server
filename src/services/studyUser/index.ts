import { getRepository } from 'typeorm';
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
