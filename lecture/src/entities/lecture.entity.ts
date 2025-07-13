import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Lecture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column({ default: 'UnTitled' })
  title: string;

  @Column()
  content: string;

  @Column()
  contentType: string;

  @Column({ nullable: true })
  ytUrl?: string;

  @Column({ nullable: true })
  cUrl?: string;

  @Column({ nullable: true })
  sum?: string;

}
