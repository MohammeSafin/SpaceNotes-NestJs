import { Body, Controller, Post, Get, Param, ParseIntPipe, Patch, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureDto } from 'src/entities/dto/lecture.dto';
import { Lecture } from 'src/entities/lecture.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateLectureDto } from 'src/entities/dto/UpdateLectureDto';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) { }

  @Post()
  async addingLecture(@Body() lecture: LectureDto) {
    // This endpoint is now specifically for URL-based lectures (YouTube)
    if (lecture.contentType !== 'YT' || !lecture.url) {
      throw new BadRequestException('URL is required for YouTube content');
    }
    await this.lectureService.createLecture(lecture);
  }
  
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async addingLectureFile(
    @Body() lecture: LectureDto, 
    @UploadedFile() file: Express.Multer.File
  ) {
    // This endpoint is specifically for file uploads
    if (lecture.contentType !== 'C' || !file) {
      throw new BadRequestException('File is required for content upload');
    }
    await this.lectureService.createLecture(lecture, file);
  }


  @Get(':courseid')
  async gettingLecture(@Param('courseid', ParseIntPipe) courseId: number,): Promise<Lecture[] | { message: string }> {
    return this.lectureService.getLecturesByCourse(courseId);
  }

  @Patch()
  async upDateContent(
    @Body() UpdateLecture: UpdateLectureDto) {
    return this.lectureService.updateContent(UpdateLecture)
  }


  @Delete(':id')
  async deleteLecture(@Param('LectureId') LectureID: number) {

    this.lectureService.deleteLecture(LectureID);
  }

  @Delete('course/:CourseId')
  async deleteLectureForCourse(@Param('CourseId') CourseId: number) {

    this.lectureService.deleteLectureForCourse(CourseId);
  }
}