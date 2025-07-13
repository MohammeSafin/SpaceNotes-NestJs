import { Module } from '@nestjs/common';
import { SummarizerController } from './summarizer.controller';
import { SummarizerService } from './summarizer.service';
import { RabbitMQWrapperModule } from 'src/modules/rabbitmq.module';
import { AiService } from 'src/service/ai.service';


@Module({
  imports: [
    RabbitMQWrapperModule
  ],
  providers: [SummarizerService, AiService],
  controllers: [SummarizerController],
  exports: [SummarizerService, RabbitMQWrapperModule, AiService]
})
export class SummarizerModule {}
