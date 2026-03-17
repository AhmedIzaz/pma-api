import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

class UserBaseDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  userName: string;

  @IsEmail()
  @ApiProperty()
  @Expose()
  userEmail?: string;
}

export class UserRegistrationDTO {
  @IsString()
  @Length(4, 50)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 50, required: true })
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  userEmail: string;

  @IsString()
  @Length(4, 50)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 50, required: true })
  userPassword: string;
}

export class UserRegistrationResponseDTO extends UserBaseDTO { }

export class UserLoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, example: 'ahmedizazbhuiyan@gmail.com' })
  userEmail: string;

  @IsString()
  @Length(4, 50)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 50, required: true, example: "ahmedizazbhuiyan@gmail.com" })
  userPassword?: string;
}

export class UserLoginResponseDTO {

  @Expose()
  @Type(() => UserBaseDTO)
  user: UserBaseDTO

  @Expose()
  @IsString()
  accessToken: string;
}

export class GoogleOAuthDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: 'Google ID token from mobile SDK' })
  idToken: string;
}
