import { Controller, Get,Post, Param, Delete, Patch, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { UpdateQuizDto } from 'src/entities/dto/updateQuiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post(':id')
  async create(@Param('id') lectureId: number) {
    return this.quizService.createQuiz(lectureId);
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.quizService.getQuiz(id);
  }


  @Patch('QuizeDone')
  async updateStatus(@Body() quizDto: UpdateQuizDto) {
    return this.quizService.updateQuiz(quizDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.quizService.deleteQuiz(id);
  }
}
