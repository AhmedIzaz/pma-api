import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { DoctorBaseDTO, DoctorServiceResponseDTO } from 'src/doctorModule/doctor.dto';
import { CommonDateEntity } from 'src/common/entities/date.entity';
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

export class BookAppointmentDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: 'number', description: 'ID of the doctor to book with' })
  doctorId: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: 'number', description: 'ID of the service selected' })
  serviceId?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'Start time in ISO format', example: '2026-05-02T10:00:00Z' })
  startTime: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: 'number', description: 'Requested duration in hours (e.g., 1 or 2)', example: 1 })
  requestedDurationHours?: number;
}

@Exclude()
export class UsersAppointmentListDTO {
  @Expose()
  consultationId: number;
  @Expose()
  @Type(() => DoctorBaseDTO)
  doctor: DoctorBaseDTO


  @Expose()
  @Type(() => DoctorServiceResponseDTO)
  service: DoctorServiceResponseDTO
}

@Exclude()
export class PrescriptionResponseDTO {
  @Expose()
  @ApiProperty()
  prescriptionId: number;

  @Expose()
  @ApiProperty()
  consultationId: number;

  @Expose()
  @ApiProperty()
  fileRef: string;

  @Expose()
  @ApiProperty()
  fileName: string;

  @Expose()
  @ApiProperty()
  dateInfo: CommonDateEntity;
}

@Exclude()
export class VerifyPrescriptionResponseDTO {
  @Expose()
  @ApiProperty({ description: 'Indicates if the file hash matches the hash stored in the database' })
  isDbMatch: boolean;

  @Expose()
  @ApiProperty({ description: 'Indicates if the file hash matches the hash stored in the blockchain' })
  isBlockchainMatch: boolean;

  @Expose()
  @ApiProperty({ description: 'The SHA256 hash of the provided file' })
  fileHash: string;

  @Expose()
  @ApiProperty({ description: 'The SHA256 hash stored in the database' })
  storedHash: string;

  @Expose()
  @ApiPropertyOptional({ description: 'The blockchain transaction hash, if available' })
  blockchainTxHash?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'The blockchain record ID, if available' })
  blockchainId?: number;
}