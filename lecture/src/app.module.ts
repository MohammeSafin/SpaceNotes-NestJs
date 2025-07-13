import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LectureModule } from './lecture/lecture.module';
import { Lecture } from './entities/lecture.entity';
import { LectureController } from './lecture/lecture.controller';
import { LectureService } from './lecture/lecture.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pdf'),
      serveRoot: '/lecture/pdf', 
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
      entities: [Lecture],
      autoLoadEntities: true,
      synchronize: true,
    }),
    LectureModule,
  ],
  controllers: [LectureController],
  providers: [LectureService],
})
export class AppModule {}
