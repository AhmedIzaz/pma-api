import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from 'src/doctorModule/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule,
    DoctorModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [TypeOrmModule, UserService, UserRepository],
})
export class UserModule { }
