import { Question } from "./question.entities";
export declare class Choice {
    id: number;
    questionId: number;
    data: string;
    question: Question;
}
