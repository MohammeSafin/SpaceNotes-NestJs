import { Controller, Post, Body, Param, UploadedFile, UseInterceptors, Delete } from '@nestjs/common';
import { SummarizerService } from './summarizer.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('summarizer')
export class SummarizerController {
  constructor(private readonly summarizerService: SummarizerService) { }

  @Delete(':id')
  async deleteLecture(@Param('LectureId') LectureID: number) {

  }

  // // First endpoint expecting a URL as a string
  // @Post('')
  // async createCourse(@Body() Summerize : SummerizeUrl) {
  //   // Pass the URL to the SummarizerService
  //   return this.summarizerService.summarizeUrl(Summerize);
  // }

  // // Second endpoint expecting a file upload
  // @Post('/file/:id')
  // @UseInterceptors(FileInterceptor('file'))
  // async create(@Param('id') CourseId: number, @UploadedFile() file: Express.Multer.File) {
  //   // Pass the file to the SummarizerService
  //   return this.summarizerService.summarizeFile(CourseId, file);
  // }
}
