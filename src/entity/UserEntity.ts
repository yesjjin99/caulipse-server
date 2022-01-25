import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Comment from './CommentEntity';
import Notification from './NotificationEntity';
import Category from './CategoryEntity';

export enum UserRoleEnum {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'USER' })
export default class User {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id!: string;

  @Column({ name: 'EMAIL' })
  email!: string;

  @Column({ name: 'PASSWORD' })
  password!: string;

  @Column({ name: 'IS_LOGOUT' })
  isLogout!: boolean;

  @Column({ name: 'TOKEN' })
  token!: string;

  @Column('enum', { enum: UserRoleEnum, name: 'ROLE' })
  role!: UserRoleEnum;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'USER_INTEREST_CATEGORY',
    joinColumn: {
      name: 'USER_ID',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'CATEGORY_CODE',
      referencedColumnName: 'code',
    },
  })
  categories!: Category[];
}

/**
 * @swagger
 * definitions:
 *  User:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        format: uuid
 *        description: "사용자 고유번호"
 *      email:
 *        type: string
 *        description: "로그인 시 사용되는 email"
 *      password:
 *        type: string
 *        description: "로그인시 사용되는 비밀번호 (암호화됨)"
 *      isLogout:
 *        type: boolean
 *        description: "유저가 현재 로그아웃 상태인지 표시"
 *      token:
 *        type: string
 *        description: "인증에 사용될 유저의 refresh token"
 *      role:
 *        type: string
 *        enum:
 *        - "GUEST"
 *        - "USER"
 *        - "ADMIN"
 *        description: "사용자의 권한을 표시"
 */
