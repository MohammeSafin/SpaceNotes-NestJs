export class CreateChoiceDto {
  data: string;
}

export class CreateQuestionDto {
  title: string;
  answer: string;
  choices: CreateChoiceDto[];
}

export class CreateQuizDto {
  lectureId: number;
  isDone?: boolean;
  questions: CreateQuestionDto[];
}
