import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import User from './UserEntity';

export enum GradeEnum {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}
@Entity({ name: 'USER_PROFILE' })
export default class UserProfile {
  @PrimaryColumn('uuid')
  USER_ID!: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  id!: User;

  @Column({ name: 'USER_NAME' })
  userName!: string;

  // FIXME: enum type으로 수정
  @Column({ name: 'DEPT' })
  dept!: string;

  @Column('enum', { enum: GradeEnum, name: 'GRADE' })
  grade!: number;

  @Column({ name: 'BIO' })
  bio!: string;

  @Column({ name: 'USER_ABOUT' })
  userAbout!: string;

  @Column({ name: 'SHOW_DEPT' })
  showDept!: boolean;

  @Column({ name: 'SHOW_GRADE' })
  showGrade!: boolean;

  @Column({ name: 'ON_BREAK' })
  onBreak!: boolean;

  @Column('int', { name: 'USER_INTEREST_CATEGORY' })
  categories!: number[];

  @Column({ name: 'LINK1' })
  link1!: string;

  @Column({ name: 'LINK2' })
  link2!: string;
}
