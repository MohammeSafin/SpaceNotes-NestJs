import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/entities/dto/login.dto';
import { RegisterUserDto } from 'src/entities/dto/register.dto';
import { ResetPassDto } from 'src/entities/dto/resetPass.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from 'src/entities/dto/UpdateUserDto';
import { sendVerificationCode } from 'src/utils/mailsender';
import { Otp } from 'src/entities/otp.entity';
import { VerifyOTPDto } from 'src/entities/dto/verifyOTP.dto';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { userImageUrl } from 'src/entities/dto/userImage.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>
  ) { }


  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateAndSendCode(email: string) {
    // Check if there's a recent OTP for this email
    const recentOtp = await this.otpRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });

    // If there's a recent OTP and it was created less than 5 minutes ago, don't send a new one
    if (recentOtp) {
      const currentTime = new Date();
      const otpCreationTime = new Date(recentOtp.createdAt);
      const timeDifference = currentTime.getTime() - otpCreationTime.getTime();
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      if (minutesDifference < 5) {
        throw new BadRequestException(`Please wait ${5 - minutesDifference} more minutes before requesting a new code`);
      }
    }

    // Generate a new 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Create new OTP entity
    const otp = this.otpRepository.create({
      email,
      otp: code,
    });

    // Save to repository
    await this.otpRepository.save(otp);

    // Send verification code
    await sendVerificationCode(email, code);

    return {
      message: 'Verification code sent successfully',
      email: email
    };
  }

  async verifyCode(VerifyOTPDto: VerifyOTPDto): Promise<boolean> {
    // Validate input data existence
    if (!VerifyOTPDto?.email || !VerifyOTPDto?.code) {
      return false;
    }

    const { email, code } = VerifyOTPDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email }
    });

    // Return false if user doesn't exist
    if (!user) {
      return false;
    }

    // Find the most recent OTP for this email and code
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        otp: code
      },
      order: { createdAt: 'DESC' },
    });

    // Check if OTP exists and is not expired
    if (otp && otp.expiresAt > new Date()) {
      // Delete the used OTP to prevent reuse
      await this.otpRepository.delete({ id: otp.id });

      // Mark user as verified
      user.verified = true;
      await this.userRepository.save(user);

      return true;
    }

    return false;
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.verified == false) {
      // Instead of throwing an error, return a response indicating verification needed
      return {
        verified: false,
        message: 'Account not verified. Please verify your account.',
        email: loginDto.email
      };
    }
    return {
      ...user,
      verified: true
    };
  }

  async createUser(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    this.generateAndSendCode(registerUserDto.email);

    const user = this.userRepository.create({
      userName: registerUserDto.userName,
      email: registerUserDto.email,
      password: hashedPassword,
      verified: false, // Ensure this is explicitly set
    });

    const savedUser = await this.userRepository.save(user);
    return {
      ...savedUser,
      message: 'User created successfully. Please verify your account using the code sent to your email.'
    };
  }

  async resetPassword(newPassword: ResetPassDto) {
    // Find the user
    const existingUser = await this.userRepository.findOne({
      where: { email: newPassword.email }
    });
    
    // Check if user exists
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword.newPassword, 10);
    
    // Update user's password
    existingUser.password = hashedPassword;
    await this.userRepository.save(existingUser);
    
    return existingUser;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id : id},
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.userName) {
      user.userName = updateUserDto.userName;
    }

    await this.userRepository.save(user);
    return;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.deleteImageFile(user.id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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

    const imageUrl = `http://165.227.141.141:3001/auth/image/${id}.jpg`;
    await this.updateImageUrl({
      userid: id,
      url: imageUrl
    });

    return {
      message: 'File uploaded successfully',
      courseId: id,
      filePath: imageUrl
    };
  }
  async updateImageUrl(user: userImageUrl) {
    const existingUser = await this.userRepository.findOne({
      where: { id: user.userid}
    });

    if (existingUser) {
      existingUser.url = user.url;
      return this.userRepository.save(existingUser);
    }
    return;
  }
  private async deleteImageFile(userId: number): Promise<void> {
    try {
      const imagePath = `./image/${userId}.jpg`;
      if (existsSync(imagePath)) {
        await unlink(imagePath);
      }
    } catch (error) {
      console.error(`Failed to delete image for course ${userId}:`, error);
    }
  }
}