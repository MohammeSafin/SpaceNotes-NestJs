import { QuizService } from './quiz.service';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    deleteQuiz(id: number): Promise<void>;
}
