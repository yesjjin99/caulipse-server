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
import Notice from './NoticeEntity';

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

  @OneToMany(() => Notice, (notice) => notice.hostId)
  notices!: Notice[];

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
