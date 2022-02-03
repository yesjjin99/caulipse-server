import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import User from './UserEntity';
import Study from './StudyEntity';

@Entity({ name: 'NOTIFICATION' })
export default class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id!: string;

  @PrimaryColumn('uuid')
  USER_ID!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @PrimaryColumn('uuid')
  STUDY_ID!: string;

  @ManyToOne(() => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  study!: Study;

  @Column({ name: 'TYPE' })
  type!: number;

  @Column({ name: 'READ' })
  read!: boolean;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;
}

/**
 * @swagger
 * definitions:
 *   Notification:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         format: uuid
 *         description: "해당 알림을 받을 사용자 id"
 *       studyId:
 *         type: string
 *         format: uuid
 *         description: "해당 알림이 발생한 스터디의 id"
 *       type:
 *         type: number
 *         description: "해당 알림이 어떠한 동작에 의해 발생했는지 표시"
 *       read:
 *         type: boolean
 *         description: "알림을 받은 사용자가 해당 알림을 읽었는지 여부"
 *       createdAt:
 *         type: string
 *         format: date-time
 *         description: "알림이 언제 생성되었는지"
 */
