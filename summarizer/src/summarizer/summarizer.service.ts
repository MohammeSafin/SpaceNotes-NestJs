import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { AiService } from 'src/service/ai.service';

@Injectable()
export class SummarizerService {
    private readonly logger = new Logger(SummarizerService.name);

    constructor(
        private aiService: AiService,
        private amqpConnection: AmqpConnection,
    ) {}

    @RabbitRPC({
        exchange: 'summarizer_exchange',
        routingKey: 'lecture.summarizer',
        queue: 'genSummarizer_queue',
    })
    private async summerizeContent(msg: { content: string, lectureId: number }) {
        const { content, lectureId } = msg;
        
        this.logger.log(`Summarizing content for lecture: ${lectureId}`);
        
        try {
            // Get the summarized content from the AI service
            const summary = await this.aiService.summarizeLecture(content);
            
            // The LectureService.handleSummarizedContent expects:
            // { content: string, title: string, lectureId: number }
            this.amqpConnection.publish('lecture_exchange', 'lecture.summarized', {
                content: summary.content,
                title: summary.title,
                lectureId
            });
            
            
            // Return the result in the expected format
            return {
                title: summary.title,
                content: summary.content
            };
        } catch (error) {
            this.logger.error(`Failed to summarize lecture ${lectureId}: ${error.message}`);
            return { success: false, message: error.message };
        }
    }
}