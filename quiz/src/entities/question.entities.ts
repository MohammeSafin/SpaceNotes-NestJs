import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Quiz } from "./quiz.entities";
import { Choice } from "./choice.entities";

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quizId: number;

  @Column()
  title: string;

  @Column()
  answer: string;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  quiz: Quiz;

  @OneToMany(() => Choice, choice => choice.question)
  choices: Choice[];
}
