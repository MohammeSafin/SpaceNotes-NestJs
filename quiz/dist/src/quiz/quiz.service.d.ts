import { Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entities';
import { Question } from 'src/entities/question.entities';
import { Choice } from 'src/entities/choice.entities';
import { AiService } from 'src/services/ai.service';
export declare class QuizService {
    private readonly quizRepository;
    private readonly questionRepository;
    private readonly choiceRepository;
    private readonly aiService;
    constructor(quizRepository: Repository<Quiz>, questionRepository: Repository<Question>, choiceRepository: Repository<Choice>, aiService: AiService);
    generateQuizFromSummary(filePath: string, lectureId: number): Promise<Quiz>;
    private shuffleArray;
    deleteQuiz(id: number): Promise<void>;
}
