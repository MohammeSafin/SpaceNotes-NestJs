import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LectureDto } from 'src/entities/dto/lecture.dto';
import { Lecture } from 'src/entities/lecture.entity';
import { DeepPartial, Repository } from 'typeorm';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { YoutubeTranscript } from 'youtube-transcript';
import * as fs from 'fs';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { exec } from 'youtube-dl-exec';
import { AssemblyAI } from 'assemblyai';
import { UpdateLectureDto } from 'src/entities/dto/UpdateLectureDto';
import { FileInterceptor } from '@nestjs/platform-express';
@Injectable()
export class LectureService {
  private assemblyai: any;

  constructor(
    @InjectRepository(Lecture)
    private LectureRepository: Repository<Lecture>,
    private amqpConnection: AmqpConnection,
  ) {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined');
    }
    this.assemblyai = new AssemblyAI({ apiKey });
  }


  private async uploadFileLocally(file: Express.Multer.File): Promise<string> {
    try {
      let pdfUrl = '';
      const uploadPath = './pdf/';
      if (file.mimetype !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      const filename = `${Date.now()}.pdf`;
      const filePath = `${uploadPath}${filename}`;

      await writeFile(filePath, file.buffer);

      pdfUrl = `http://165.227.141.141:3004/lecture/pdf/${filename}`;
      console.log('PDF URL:', pdfUrl);
      return pdfUrl;
    } catch (error) {
      console.error('Error creating lecture:', error);
      throw error;
    }
  }

  @RabbitRPC({
    exchange: 'lecture_exchange',
    routingKey: 'lecture.summarized',
    queue: 'sumLecture_queue',
  })
  async handleSummarizedContent(msg: { content: string, title: string, lectureId: number }) {
    const { content, title, lectureId } = msg;
    try {
      const lecture = await this.LectureRepository.findOne({
        where: { id: lectureId }
      });

      if (!lecture) {
        return { message: 'Lecture not found' };
      }
      console.log("content: " + content);
      console.log("titile " + title);

      lecture.sum = content;
      lecture.title = title;

      await this.LectureRepository.save(lecture);
      return { success: true };
    } catch (error) {
      console.error('Error adding summarized content:', error);
      return { message: error.message };
    }
  }
  @RabbitRPC({
    exchange: 'lecture_exchange',
    routingKey: 'lecture.get',
    queue: 'getlecture_queue',
  })
  async handleLectureGetRequest(msg: { lectureId: number }) {
    try {
      const { lectureId } = msg;
      const result = await this.getLectureContentById(lectureId);
      console.log("Returned result"+ result);
      return result;
    } catch (error) {
      console.error('Error getting lecture content:', error);
      return { success: false, message: error.message };
    }
  }

  async getLectureContentById(lectureId: number) {
    const lecture = await this.LectureRepository.findOne({
      where: { id: lectureId },
    });
    if(!lecture){
      throw new Error(`Failed To find lecture with id: ${lectureId}`);
    }
    
    return lecture.sum;
  }

  async createLecture(lecture: LectureDto, file?: Express.Multer.File) {
    try {
      let pdfUrl = '';
      if (file) {
        pdfUrl = await this.uploadFileLocally(file);
      }
      this.amqpConnection.publish('lecture_exchange', 'lecture.create', {
        lecture, pdfUrl
      });
      return { success: true, message: 'Lecture creation started' };
    } catch (error) {
      console.error('Error creating lecture :', error);
      throw error;
    }
  }


  @RabbitRPC({
    exchange: 'lecture_exchange',
    routingKey: 'lecture.create',
    queue: 'createLecture_queue',
  })
  async handleLectureCreation(msg: { lecture: LectureDto, pdfUrl?: string }) {
    const { lecture, pdfUrl } = msg;
    if (!lecture.courseId || !lecture.contentType || !lecture.url) {
      return { message: 'Missing required fields' };
    }
    let content = '';
    try {
      if (lecture.contentType === 'YT' && lecture.url) {
        console.log("videoURL", lecture.url);
        const videoId = this.extractYoutubeVideoId(lecture.url);
        if (!videoId) {
          return { message: 'Invalid YouTube URL' };
        }
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
          content = transcriptItems.map(item => item.text).join(' ');
          console.log("content", content);
        } catch (error) {
          if (error.message && error.message.includes('Transcript is disabled')) {
            console.log('Transcript is disabled, using fallback method...');
            content = await this.getTranscriptUsingFallback(videoId);
          } else {
            throw error;
          }
        }
      } else if (lecture.contentType === 'C' && lecture.url) {
        try {
          if (pdfUrl) {
            lecture.url = pdfUrl;
          }
          content = await this.extractPdfContent(lecture.url);
          console.log(content);
        } catch (error) {
          return { message: 'Failed to extract content from PDF' };
        }
      } else {
        return { message: 'Invalid content type' };
      }

      const lectureEntity = this.LectureRepository.create({
        courseId: lecture.courseId,
        content: content,
        contentType: lecture.contentType,
        ytUrl: lecture.contentType === 'YT' ? lecture.url : null,
        cUrl: lecture.contentType === 'C' ? lecture.url : null
      } as DeepPartial<Lecture>);

      const savedLecture = await this.LectureRepository.save(lectureEntity);

      try {
        this.amqpConnection.publish('summarizer_exchange', 'lecture.summarizer', {
          content,
          lectureId: savedLecture.id
        });
        console.log('Published to summarizer');
      } catch (error) {
        console.error('Error publishing to summarizer:', error);
      }

      console.log('Lecture created:', savedLecture.id);

      return savedLecture;
    } catch (error) {
      return { message: `Failed to create lecture: ${error.message}` };
    }
  }

  private async getTranscriptUsingFallback(videoId: string): Promise<string> {
    const tempDir = path.join(__dirname, '../../temp');
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      console.log('Downloading audio...');
      await exec(`https://www.youtube.com/watch?v=${videoId}`, {
        extractAudio: true,
        audioFormat: 'mp3',
        output: audioPath,
        noCheckCertificates: true,
      });

      console.log('Uploading to AssemblyAI...');
      const audioFile = fs.readFileSync(audioPath);

      const transcriptResult = await this.transcribeAudio(audioFile);
      console.log('Transcript:', transcriptResult);

      console.log(transcriptResult)
      return transcriptResult;
    } catch (error) {
      console.error('Fallback transcription error:', error);
      throw new Error(`Failed to transcribe using fallback method: ${error.message}`);
    } finally {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
  }

  private async transcribeAudio(audioFile: Buffer): Promise<string> {
    console.log("audiooo:", audioFile);
    const transcript = await this.assemblyai.transcripts.transcribe({
      audio: audioFile
    });
    console.log('Transcript:', transcript.text);
    return transcript.text;
  }
  private extractYoutubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async getLecturesByCourse(courseId: number): Promise<Lecture[] | { message: string }> {
    const lectures = await this.LectureRepository.find({ where: { courseId } });

    if (!lectures || lectures.length === 0) {
      return { message: 'No lectures found for this course' };
    }

    return lectures;
  }

  async updateContent(UpdateLecture: UpdateLectureDto) {

    const existingLecture = await this.LectureRepository.findOne({
      where: { id: UpdateLecture.Id }
    });

    if (UpdateLecture.sum) {

      if (existingLecture) {

        existingLecture.sum = UpdateLecture.sum;
        await this.LectureRepository.save(existingLecture);
        return { message: "the content is updated" };

      }

    }

  }

  async deleteLecture(LectureID: number) {

    const lectureDelete = await this.LectureRepository.findOne({
      where: { id: LectureID }
    })

    if (lectureDelete) {

      this.LectureRepository.remove(lectureDelete);

    }


  }

  async deleteLectureForCourse(CourseId: number) {
    const lectures = await this.LectureRepository.find({
      where: { courseId: CourseId },
    });

    if (lectures.length === 0) {
      return { message: 'No lectures found for this course' };
    }

    await this.LectureRepository.remove(lectures);
    return { message: 'All lectures for the course have been removed' };
  }

  private async extractPdfContent(pdfUrl: string): Promise<string> {
    const fs = require('fs');
    const pdf = require('pdf-parse');
    const axios = require('axios');

    const isUrl = (urlString: string): boolean => {
      try {
        new URL(urlString);
        return urlString.startsWith('http://') || urlString.startsWith('https://');
      } catch (e) {
        return false;
      }
    };

    let dataBuffer;

    if (isUrl(pdfUrl)) {
      const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      dataBuffer = fs.readFileSync(pdfUrl);
    }
    const data = await pdf(dataBuffer);
    return data.text;
  }

}
