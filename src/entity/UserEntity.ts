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
import Study from './StudyEntity';
import Category from './CategoryEntity';

enum UserRoleEnum {
  GUEST = 'GUEST',
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

  @ManyToMany(() => Study)
  @JoinTable({ name: 'STUDY_USER' })
  studies!: Study[];

  @ManyToMany(() => Category)
  @JoinTable({ name: 'USER_INTEREST_CATEGORY' })
  categories!: Category[];
}
