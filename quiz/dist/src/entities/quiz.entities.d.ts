import { Question } from "./question.entities";
export declare class Quiz {
    id: number;
    lectureId: number;
    isDone: boolean;
    questions: Question[];
}
