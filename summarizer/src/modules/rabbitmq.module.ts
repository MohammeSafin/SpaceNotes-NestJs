// src/modules/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL as string,
      exchanges: [
        {
          name: 'lecture_exchange',
          type: 'topic',
        },
        {
          name: 'summarizer_exchange',
          type: 'topic',
        }
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 20000, // Increase timeout
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitMQWrapperModule { }