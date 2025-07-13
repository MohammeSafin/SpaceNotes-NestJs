import { Body, Controller, Delete, Get, Param, Patch, Post,UploadedFile,UseInterceptors } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseDto } from 'src/entities/dto/course.dto';
import { UpdateDescription } from 'src/entities/dto/UpdateDescription';
import { memoryStorage } from 'multer';
import { Express } from 'express';
import { Course } from 'src/entities/course.entity';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('course')
export class CourseController {
    constructor(private readonly CourseService: CourseService){}

    @Post("createcourse/")
    async createcourse(@Body() CourseDto: CourseDto){
        return this.CourseService.createCourse(CourseDto);
    }

    @Delete("deletcourse/:id")
    async deletecourse(@Param("id") id:number ){
        return this.CourseService.deleteCourse(id)
    }

    @Patch("updateDescription/")
    async updateDescription( 
    @Body() UpdateDescription: UpdateDescription){
        return this.CourseService.updateDescription(UpdateDescription)
    }

    @Get(':id')
    async getCourse(@Param('id') id: number): Promise<Course[] | {message: string}> {
      return this.CourseService.getCourse(id);
    }

    @Delete(':userId')
    async DeleteCoursesUser(@Param("userId") userId: number){
        this.CourseService.deleteCourseForUser(userId);
    }

    @Post(':id/uploadImage')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage()
      })
    )
    async uploadFile(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
      return this.CourseService.uploadFile(file, id);
    }
}