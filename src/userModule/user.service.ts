import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UserLoginDTO,
  UserLoginResponseDTO,
  UserRegistrationDTO,
} from './user.dto';
import { UserRepository } from './user.repository';
import { comparePassword, generateHashPassword } from 'src/common/utility';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async userRegistration(data: UserRegistrationDTO) {
    try {
      const { userName, userEmail, userPassword } = data ?? {};
      const existingUser = await this.userRepository.findByEmail(userEmail);
      if (existingUser?.userId) {
        throw new ConflictException('User with this email already exist');
      }

      const hashedPassword = await generateHashPassword(userPassword);
      const { userPassword: _, ...createdUser } =
        await this.userRepository.create({
          userName,
          userEmail,
          userPassword: hashedPassword,
        });

      if (!createdUser?.userId) {
        throw new ConflictException('User creation failed');
      }

      return createdUser;
    } catch (error) {
      console.log('Error during userRegistration: ', error);
      throw error;
    } finally {
    }
  }

  async userLogin(data: UserLoginDTO): Promise<UserLoginResponseDTO> {
    try {
      const { userEmail, userPassword } = data ?? {};
      const existingUser = await this.userRepository.findByEmail(userEmail);
      if (!existingUser?.userId) {
        throw new ConflictException('Invalid email or password');
      }

      const passwordMatched = await comparePassword(
        userPassword,
        existingUser?.userPassword,
      );
      if (!passwordMatched) {
        throw new ConflictException('Invalid email or password');
      }

      const jwtPayload = {
        userId: existingUser?.userId,
        userName: existingUser?.userName,
        userEmail,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);
      return {
        accessToken,
        user: existingUser,
      };
    } catch (error) {
      console.log('Error during userLogin: ', error);
      throw error;
    } finally {
    }
  }
}
