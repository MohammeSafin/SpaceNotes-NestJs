import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Choice } from 'src/entities/choice.entities';
import { Question } from 'src/entities/question.entities';
import { Quiz } from 'src/entities/quiz.entities';
import { QuizController } from './quiz.controller';
import { AiService } from 'src/services/ai.service';
import { RabbitMQWrapperModule } from 'src/modules/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Choice]),
    RabbitMQWrapperModule
  ],
  providers: [QuizService, AiService],
  controllers: [QuizController],
  exports: [QuizService, TypeOrmModule, RabbitMQWrapperModule, AiService]
})
export class QuizModule { }
