import { Module } from '@nestjs/common';
import { QuizController } from './quiz/quiz.controller';
import { QuizModule } from './quiz/quiz.module';
import { QuizService } from './quiz/quiz.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entities';
import { Question } from './entities/question.entities';
import { Choice } from './entities/choice.entities';
import { RabbitMQWrapperModule } from 'src/modules/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Quiz, Question, Choice],
      autoLoadEntities: true,
      synchronize: true,
    }),
    QuizModule,
  ],
  controllers: [ QuizController],
  providers: [QuizService],
})
export class AppModule {}
