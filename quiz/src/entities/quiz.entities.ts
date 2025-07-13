import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Question } from "./question.entities";

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lectureId: number;

  @Column({ default: false })
  loading: boolean;

  @Column({ default: false })
  isDone: boolean;

  @OneToMany(() => Question, question => question.quiz)
  questions: Question[];
}