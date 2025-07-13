import { Module } from '@nestjs/common';
import { SummarizerModule } from './summarizer/summarizer.module';
import { ConfigModule } from '@nestjs/config';
import { SummarizerService } from './summarizer/summarizer.service';
import { SummarizerController } from './summarizer/summarizer.controller';

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SummarizerModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
