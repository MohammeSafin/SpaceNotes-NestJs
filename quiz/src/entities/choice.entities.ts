import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Question } from "./question.entities";

@Entity()
export class Choice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionId: number;

  @Column()
  data: string;

  @ManyToOne(() => Question, question => question.choices)
  question: Question;
}
