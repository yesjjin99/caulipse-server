import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import User from './UserEntity';

@Entity({ name: 'NOTICE' })
export default class Notice {
  @PrimaryColumn('uuid', { name: 'ID' })
  id!: string;

  @Column({ name: 'TITLE' })
  title!: string;

  @Column({ name: 'ABOUT' })
  about!: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;

  @Column({ name: 'VIEWS' })
  views!: number;

  @ManyToOne(() => User, (user) => user.notices)
  @JoinColumn({ name: 'HOST_ID' })
  hostId!: User;
}
