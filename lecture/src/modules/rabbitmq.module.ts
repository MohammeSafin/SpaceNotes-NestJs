// src/modules/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL as string,
      exchanges: [
        {
          name: 'summarizer_exchange',
          type: 'topic',
        },
        {
          name: 'lecture_exchange',
          type: 'topic',
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 10000,
      },
    }
    ),
  ],
  exports: [RabbitMQModule],
})
export class RabbitMQWrapperModule { }