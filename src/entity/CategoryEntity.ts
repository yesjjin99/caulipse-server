import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'CATEGORY' })
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'CODE' })
  code!: number;

  // enum 타입으로 수정 필요
  @Column({ name: 'MAIN' })
  main!: string;

  // enum 타입으로 수정 필요
  @Column({ name: 'SUB' })
  sub!: string;
}
