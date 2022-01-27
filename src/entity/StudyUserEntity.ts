import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Study from './StudyEntity';
import User from './UserEntity';

@Entity({ name: 'STUDY_USER' })
export default class StudyUser {
  @PrimaryColumn('uuid')
  USER_ID!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @PrimaryColumn('uuid')
  STUDY_ID!: string;

  @ManyToOne(() => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  study!: Study;

  @Column({ name: 'IS_ACCEPTED' })
  isAccepted!: boolean;

  @Column({ name: 'TEMP_BIO' })
  tempBio!: string;
}

/**
 * @swagger
 * definitions:
 *   StudyUser:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *         format: uuid
 *         description: "스터디 참가요청을 보낸 사용자 id"
 *       studyId:
 *         type: string
 *         format: uuid
 *         description: "사용자가 참가요청을 보낸 스터디 id"
 *       isAccepted:
 *         type: boolean
 *         description: "해당 사용자의 해당 스터디 참가요청이 수락되었는지의 여부"
 *       tempBio:
 *         type: string
 *         description: "스터디 가입시 호스트에게 보여지는 사용자의 인사말"
 */
