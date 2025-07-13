import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Otp } from 'src/entities/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule]
})
export class AuthModule {
}
