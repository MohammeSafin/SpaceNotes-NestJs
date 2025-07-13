import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entities';
import { Question } from 'src/entities/question.entities';
import { Choice } from 'src/entities/choice.entities';
import { AiService } from 'src/services/ai.service';
import { promises as fs } from 'fs';
import { UpdateQuizDto } from 'src/entities/dto/updateQuiz.dto';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
        @InjectRepository(Choice)
        private readonly choiceRepository: Repository<Choice>,
        private readonly aiService: AiService,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async updateQuiz(quizDto: UpdateQuizDto) {
        console.log('Updating quiz with data:', quizDto);

        const quiz = await this.quizRepository.findOne({
            where: { id: quizDto.id }
        });

        console.log('Found quiz:', quiz);

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        console.log('Original isDone value:', quiz.isDone);
        quiz.isDone = quizDto.isDone;
        console.log('Updated isDone value:', quiz.isDone);

        const result = await this.quizRepository.save(quiz);
        console.log('Save operation result:', result);

        // Verify it was saved
        const verifyQuiz = await this.quizRepository.findOne({
            where: { id: quizDto.id }
        });
        console.log('Verification query result:', verifyQuiz);

        return result;
    }

    async createQuiz(lectureId: number) {
        try {
            this.amqpConnection.publish('quiz_exchange', 'quiz.create', {
                lectureId,
            });

            return { success: true, message: 'Quiz creation started' };
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    }

    async getQuiz(id: number) {
        // Using query builder for more control over the query
        const quiz = await this.quizRepository
            .createQueryBuilder('quiz')
            .leftJoinAndSelect('quiz.questions', 'questions')
            .leftJoinAndSelect('questions.choices', 'choices')
            .where('quiz.lectureId = :lectureId', { lectureId: id })
            .getOne();

        if (!quiz) {
            throw new NotFoundException(`Quiz for lecture with ID ${id} not found`);
        }

        return quiz;
    }

    async deleteQuiz(id: number): Promise<void> {
        // Use a transaction to ensure all operations succeed or fail together
        await this.quizRepository.manager.transaction(async manager => {
            // 1. First find all questions related to this quiz
            const questions = await this.questionRepository.find({
                where: { quizId: id }
            });

            // 2. Delete all choices for each question
            for (const question of questions) {
                await manager.delete(Choice, { questionId: question.id });
            }

            // 3. Delete all questions for this quiz
            await manager.delete(Question, { quizId: id });

            // 4. Finally delete the quiz itself
            await manager.delete(Quiz, id);

            console.log(`Successfully deleted Quiz ID ${id} with all related questions and choices`);
        });
    }
    @RabbitRPC({
        exchange: 'quiz_exchange',
        routingKey: 'quiz.create',
        queue: 'quiz_queue',
    })
    async handleQuizCreation(msg: { lectureId: number }) {
        const { lectureId } = msg;
        try {
            const quiz = await this.generateQuizFromSummary(lectureId);
            await this.sendQuizCreationNotification(lectureId, quiz.id);
            return {
                success: true,
                quiz,
            };

        } catch (error) {
            console.error('Error handling quiz creation:', error);
            return { success: false, message: error.message };
        }
    }

    async generateQuizFromSummary(lectureId: number): Promise<Quiz> {
        try {
            const result = await this.amqpConnection.request({
                exchange: 'lecture_exchange',
                routingKey: 'lecture.get',
                payload: { lectureId },
                timeout: 10000,
            });
            if (!result) {
                throw new Error('Failed to get lecture');
            }
            console.log('Got lecture content:', result);

            const aiResponse = await this.aiService.generateQuizQuestions(result);

            const quiz = new Quiz();
            quiz.lectureId = lectureId;
            quiz.isDone = false;
            quiz.loading = true;

            const savedQuiz = await this.quizRepository.save(quiz);

            const savedQuestions: Question[] = [];

            for (const questionData of aiResponse.questions) {
                const question = new Question();
                question.quizId = savedQuiz.id;
                question.title = questionData.title; question.answer = questionData.correctAnswer;
                question.answer = questionData.correctAnswer;
                question.quiz = savedQuiz;

                const savedQuestion = await this.questionRepository.save(question);

                const allChoices = [...questionData.choices];
                this.shuffleArray(allChoices);

                for (const choiceText of allChoices) {
                    const choice = new Choice();
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
        } catch (error) {
            console.error('Error generating quiz from summary:', error);
            throw new Error(`Failed to generate quiz: ${error.message}`);
        }
    }
    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    private async sendQuizCreationNotification(lectureId: number, quizId: number): Promise<void> {
        try {
            console.log(`Sending FCM notification for quiz ${quizId} of lecture ${lectureId}`);

            // Publish notification event to a notification service
            await this.amqpConnection.publish(
                'notification_exchange',
                'notification.send',
                {
                    type: 'QUIZ_CREATED',
                    title: 'Quiz Created',
                    body: `A new quiz for lecture #${lectureId} is now available.`,
                    data: {
                        lectureId: lectureId,
                        quizId: quizId
                    }
                }
            );

            console.log('FCM notification request sent successfully');
        } catch (error) {
            console.error('Error requesting FCM notification:', error);
            // We don't throw to avoid failing the main process if notification fails
        }
    }
}
