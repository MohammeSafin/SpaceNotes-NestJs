"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quiz_entities_1 = require("../entities/quiz.entities");
const question_entities_1 = require("../entities/question.entities");
const choice_entities_1 = require("../entities/choice.entities");
const ai_service_1 = require("../services/ai.service");
const fs_1 = require("fs");
let QuizService = class QuizService {
    quizRepository;
    questionRepository;
    choiceRepository;
    aiService;
    constructor(quizRepository, questionRepository, choiceRepository, aiService) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
        this.aiService = aiService;
    }
    async generateQuizFromSummary(filePath, lectureId) {
        try {
            const fileContent = await fs_1.promises.readFile(filePath, 'utf8');
            const aiResponse = await this.aiService.generateQuizQuestions(fileContent);
            const quiz = new quiz_entities_1.Quiz();
            quiz.lectureId = lectureId;
            quiz.isDone = false;
            const savedQuiz = await this.quizRepository.save(quiz);
            const savedQuestions = [];
            for (const questionData of aiResponse.questions) {
                const question = new question_entities_1.Question();
                question.quizId = savedQuiz.id;
                question.title = questionData.title;
                question.answer = questionData.correctAnswer;
                question.quiz = savedQuiz;
                const savedQuestion = await this.questionRepository.save(question);
                const allChoices = [...questionData.choices];
                if (!allChoices.includes(questionData.correctAnswer)) {
                    allChoices.push(questionData.correctAnswer);
                }
                this.shuffleArray(allChoices);
                for (const choiceText of allChoices) {
                    const choice = new choice_entities_1.Choice();
                    choice.questionId = savedQuestion.id;
                    choice.data = choiceText;
                    choice.question = savedQuestion;
                    await this.choiceRepository.save(choice);
                }
                savedQuestions.push(savedQuestion);
            }
            const completeQuiz = await this.quizRepository.findOne({
                where: { id: savedQuiz.id },
                relations: ['questions', 'questions.choices']
            });
            if (!completeQuiz) {
                throw new Error('Quiz not found after saving.');
            }
            return completeQuiz;
        }
        catch (error) {
            console.error('Error generating quiz from summary:', error);
            throw new Error(`Failed to generate quiz: ${error.message}`);
        }
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    async deleteQuiz(id) {
        await this.quizRepository.delete(id);
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_entities_1.Quiz)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entities_1.Question)),
    __param(2, (0, typeorm_1.InjectRepository)(choice_entities_1.Choice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map