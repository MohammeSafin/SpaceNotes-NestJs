import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync} from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { Course } from 'src/entities/course.entity';
import { CourseDto } from 'src/entities/dto/course.dto';
import { CourseImgUrl } from 'src/entities/dto/CourseImgUrl.dto';
import { UpdateDescription } from 'src/entities/dto/UpdateDescription';
import { Repository } from 'typeorm';



@Injectable()
export class CourseService {
  constructor(
      @InjectRepository(Course)
      private courseRepository: Repository<Course>
    ) { }

    async getCourse(id: number) {
      const courses = await this.courseRepository.find({
        where: { userId: id }
      });
  
      if (courses && courses.length > 0) {
        return courses;
      }
  
      return { message: 'No Course Available' };
    }

    async createCourse(coursedto: CourseDto){
      const course = this.courseRepository.create({
        userId: coursedto.userId,
        CourseName: coursedto.CourseName,
        CourseTag: coursedto.CourseTag,
        description: coursedto.description
      });

      return await this.courseRepository.save(course);
    }

  
    async deleteCourse(id: number) {
      const course = await this.courseRepository.findOne({
        where: { id: id }
      });
      
      if (course) {
        await this.deleteImageFile(id);
        
        await this.courseRepository.remove(course);
        return { message: 'Course and associated image deleted successfully' };
      } else {
        throw new Error(`Course with id ${id} not found`);
      }
    }

    async deleteCourseForUser(id: number) {
      const courses = await this.courseRepository.find({
        where: { userId: id }
      });
      
      for (const course of courses) {
        await this.deleteImageFile(course.id);
      }
      await this.courseRepository.delete({ userId: id });
      
      return { message: `All courses and associated images for user ${id} deleted successfully` };
    }
    
    async updateDescription(updateDescription: UpdateDescription){
      const existingCourse = await this.courseRepository.findOne({
        where: {id : updateDescription.id}        
      });

      if(updateDescription.description){
        if(existingCourse){
          existingCourse.description = updateDescription.description;
           await this.courseRepository.save(existingCourse);
            return { message: 'Course deleted successfully' };

        }
      }
      return;
    }

    async uploadFile(file: Express.Multer.File, id: number) {
      const uploadPath = './image/';
    
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      const filePath = `${uploadPath}${id}.jpg`;
      
      await writeFile(filePath, file.buffer);

      const imageUrl = `http://165.227.141.141:3002/course/image/${id}.jpg`;
      await this.updateImageUrl({
        courseId: id,
        url: imageUrl
      });

      return {
        message: 'File uploaded successfully',
        courseId: id,
        filePath: imageUrl
      };
    }
    
    async updateImageUrl(course: CourseImgUrl){
      const existingCourse = await this.courseRepository.findOne({
        where:{id : course.courseId}
      });
    
      if(existingCourse){
        existingCourse.imageUrl = course.url;
        return this.courseRepository.save(existingCourse);
      }
      return;
    }
    private async deleteImageFile(courseId: number): Promise<void> {
      try {
        const imagePath = `./image/${courseId}.jpg`;
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch (error) {
        console.error(`Failed to delete image for course ${courseId}:`, error);
      }
    }

}
