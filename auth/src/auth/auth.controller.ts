import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { LoginUserDto } from 'src/entities/dto/login.dto';
import { RegisterUserDto } from 'src/entities/dto/register.dto';
import { ResetPassDto } from 'src/entities/dto/resetPass.dto';
import { AuthService } from './auth.service';
import { memoryStorage } from 'multer';
import { Express } from 'express';
import { UpdateUserDto } from 'src/entities/dto/UpdateUserDto';
import { VerifyOTPDto as OTPDto } from 'src/entities/dto/verifyOTP.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }


  @Post('register')
  async createUser(
    @Body() createUserDto: RegisterUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Patch('resetPassword/')
  async resetPasswordSelf(
    @Body() resetPasswordDto: ResetPassDto
  ): Promise<void> {
    this.authService.resetPassword(resetPasswordDto);
  }


  @Delete('deleteSelf')
  async deleteSelf(@Req() req) {
    const userId = req.user?.userId;
    return this.authService.deleteUser(userId);
  }

  @Post('verify')
  async verifyOTP(@Body() VerifyOTPDto: OTPDto) {
    return this.authService.verifyCode(VerifyOTPDto);
  }

  @Post('code')
  async SendOTP(@Body() OTPDto: OTPDto) {
    return this.authService.generateAndSendCode(OTPDto.email);
  }

  @Get()
  async self(@Req() req) {
    const userId = req.user.userId;
    return this.authService.findOne(userId);
  }

  @Post(':id/uploadImage')
  @UseInterceptors(
    FileInterceptor('file', {
      // No storage configuration here - we'll let the service handle it
      storage: memoryStorage()
    })
  )
  async uploadFile(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.authService.uploadFile(file, id);
  }


}