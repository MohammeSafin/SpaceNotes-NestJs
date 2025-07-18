import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService, TypeOrmModule]

})
export class CourseModule {}
