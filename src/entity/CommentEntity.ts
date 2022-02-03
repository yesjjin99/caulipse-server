import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './UserEntity';
import Study from './StudyEntity';

@Entity({ name: 'COMMENT' })
export default class Comment {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id!: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;

  @Column({ name: 'IS_NESTED' })
  isNested!: boolean;

  @Column({ name: 'CONTENT' })
  content!: string;

  @ManyToOne(() => User, (user) => user.comments, { nullable: true })
  @JoinColumn({ name: 'USER_ID' })
  user?: User | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  nestedComments!: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.nestedComments, {
    nullable: true,
  })
  @JoinColumn({ name: 'NESTED_COMMENT_ID' })
  parentComment?: Comment | null;

  @ManyToOne(() => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  study!: Study;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'USER_METOO_COMMENT',
    joinColumn: {
      name: 'COMMENT_ID',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'USER_ID',
      referencedColumnName: 'id',
    },
  })
  metooComment!: User[];
}

/**
 * @swagger
 * definitions:
 *  Comment:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        format: uuid
 *        description: "해당 스터디 질문글의 고유한 id"
 *      createdAt:
 *        type: string
 *        format: date-time
 *        description: "해당 질문글이 작성된 시간"
 *      isNested:
 *        type: boolean
 *        description: "해당 질문글이 다른 질문글의 답변으로 작성된 질문글인지의 여부 (대댓글이 달려있는지의 여부)"
 *      content:
 *        type: string
 *        description: "질문글 본문 내용"
 *      userId:
 *        type: string
 *        format: uuid
 *        description: "해당 스터디 질문글을 등록한 사용자 id"
 *      studyId:
 *        type: string
 *        format: uuid
 *        description: "해당 스터디 id"
 *      nestedCommentId:
 *        type: string
 *        format: uuid
 *        description: "해당 질문글이 어떤 질문글의 답변으로 작성되었을 경우, 그 대상 질문글의 id"
 */
