import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseModule } from './course/course.module';
import { CourseService } from './course/course.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CourseController } from './course/course.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'image'),
      serveRoot: '/course/image', 
    }),
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
      entities: [Course],
      autoLoadEntities: true,
      synchronize: true,
    }),
    CourseModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class AppModule {}
