import { Module } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Lecture } from 'src/entities/lecture.entity';
import { RabbitMQWrapperModule } from 'src/modules/rabbitmq.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture]),
    RabbitMQWrapperModule
  ],
  providers: [LectureService],
  controllers: [LectureController],
  exports: [LectureService, TypeOrmModule, RabbitMQWrapperModule]

})
export class LectureModule {}
