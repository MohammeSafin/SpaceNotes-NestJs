export declare class CreateChoiceDto {
    data: string;
}
export declare class CreateQuestionDto {
    title: string;
    answer: string;
    choices: CreateChoiceDto[];
}
export declare class CreateQuizDto {
    lectureId: number;
    isDone?: boolean;
    questions: CreateQuestionDto[];
}
