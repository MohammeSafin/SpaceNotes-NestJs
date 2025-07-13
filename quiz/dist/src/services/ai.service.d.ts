import { ConfigService } from '@nestjs/config';
interface QuizQuestionChoice {
    title: string;
    correctAnswer: string;
    choices: string[];
}
interface GeneratedQuiz {
    questions: QuizQuestionChoice[];
}
export declare class AiService {
    private configService;
    private apiKey;
    private apiUrl;
    constructor(configService: ConfigService);
    generateQuizQuestions(content: string): Promise<GeneratedQuiz>;
}
export {};
