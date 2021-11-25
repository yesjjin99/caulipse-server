import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'CATEGORY' })
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'CODE' })
  code!: number;

  @Column('enum', { name: 'MAIN' })
  main!: string;

  @Column('enum', { name: 'SUB' })
  sub!: string;
}
