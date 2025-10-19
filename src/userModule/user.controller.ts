import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import {
  UserLoginDTO,
  UserLoginResponseDTO,
  UserRegistrationDTO,
  UserRegistrationResponseDTO,
} from './user.dto';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async registration(
    @Body() body: UserRegistrationDTO,
  ): Promise<UserRegistrationResponseDTO> {
    const createdUser = await this.userService.userRegistration(body);
    return createdUser;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/login')
  async login(@Body() body: UserLoginDTO): Promise<UserLoginResponseDTO> {
    const loginInformation = await this.userService.userLogin(body);
    return loginInformation;
  }
}
