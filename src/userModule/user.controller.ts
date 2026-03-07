import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import {
  GoogleOAuthDTO,
  UserLoginDTO,
  UserLoginResponseDTO,
  UserRegistrationDTO,
  UserRegistrationResponseDTO,
} from './user.dto';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/hello')
  async hello() {
    return 'Hello from user controller';
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserRegistrationResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/registration')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  async registration(
    @Body() body: UserRegistrationDTO,
  ): Promise<UserRegistrationResponseDTO> {
    const createdUser = await this.userService.userRegistration(body);
    return createdUser;
  }

  @Throttle({ default: { limit: 2, ttl: 40 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: UserLoginDTO): Promise<UserLoginResponseDTO> {
    const loginInformation = await this.userService.userLogin(body);
    return loginInformation;
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/google-oauth')
  @ApiOperation({
    summary: 'Login or register via Google OAuth (mobile ID token)',
    description:
      'Accepts a Google ID token obtained from the mobile SDK, validates it, creates the user if they do not exist, and returns a JWT access token.',
  })
  async googleOAuth(@Body() body: GoogleOAuthDTO): Promise<UserLoginResponseDTO> {
    return this.userService.googleOAuthLogin(body);
  }
}
