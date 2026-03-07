import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GoogleOAuthDTO,
  UserLoginDTO,
  UserLoginResponseDTO,
  UserRegistrationDTO,
} from './user.dto';
import { UserRepository } from './user.repository';
import { comparePassword, generateHashPassword } from 'src/common/utility';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { TRegistrationTypeEnum } from 'src/common/enums/database.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TEnvironmentVariables>,
  ) { }

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

  async googleOAuthLogin(data: GoogleOAuthDTO): Promise<UserLoginResponseDTO> {
    try {
      const { idToken } = data ?? {};

      // 1. Verify the Google ID token
      const clientId = this.configService.get('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(clientId);

      let googlePayload: TokenPayload | undefined;
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: clientId,
        });
        googlePayload = ticket.getPayload();
      } catch {
        throw new UnauthorizedException('Invalid or expired Google ID token');
      }

      if (!googlePayload) {
        throw new UnauthorizedException('Google token payload is invalid');
      }

      const { sub: googleUserId, email, name } = googlePayload;

      if (!googleUserId) {
        throw new UnauthorizedException('Google token payload is missing user ID');
      }

      // 2. Find user by socialAuthId (Google sub)
      let user = await this.userRepository.findBySocialId(googleUserId);

      // 3. If not found by socialAuthId, try by email
      if (!user && email) {
        user = await this.userRepository.findByEmail(email);
        if (user) {
          // Link the existing email account to this Google identity
          user.socialAuthId = googleUserId;
          user.userRegistrationType = TRegistrationTypeEnum.GOOGLE;
          await this.userRepository.create(user);
        }
      }

      // 4. If still not found, create a new user
      if (!user) {
        user = await this.userRepository.create({
          userName: name ?? email ?? 'Google User',
          userEmail: email,
          userRegistrationType: TRegistrationTypeEnum.GOOGLE,
          socialAuthId: googleUserId,
        });
      }

      if (!user?.userId) {
        throw new ConflictException('Failed to sign in with Google');
      }

      // 5. Issue JWT — same shape as normal login
      const jwtPayload = {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);
      return {
        accessToken,
        user,
      };
    } catch (error) {
      console.log('Error during googleOAuthLogin: ', error);
      throw error;
    }
  }
}
