import { Quiz } from "./quiz.entities";
import { Choice } from "./choice.entities";
export declare class Question {
    id: number;
    quizId: number;
    title: string;
    answer: string;
    quiz: Quiz;
    choices: Choice[];
}
