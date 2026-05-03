import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TConsultationStatusEnum } from 'src/common/enums/database.enum';

// ─── Doctor Base ────────────────────────────────────────

export class DoctorBaseDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  doctorId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  doctorName: string;

  @IsEmail()
  @ApiProperty()
  @Expose()
  doctorEmail: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Expose()
  specialization?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Expose()
  qualifications?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Expose()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Expose()
  bio?: string;
}

// ─── Registration ───────────────────────────────────────

export class DoctorRegistrationDTO {
  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 2, maxLength: 100, required: true })
  doctorName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  doctorEmail: string;

  @IsString()
  @Length(4, 50)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 50, required: true })
  doctorPassword: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', description: 'e.g. Cardiology, General Medicine' })
  specialization?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', description: 'e.g. MBBS, MD' })
  qualifications?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string' })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string' })
  bio?: string;
}

export class DoctorRegistrationResponseDTO extends DoctorBaseDTO { }

// ─── Login ──────────────────────────────────────────────

export class DoctorLoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, example: 'doctor@example.com' })
  doctorEmail: string;

  @IsString()
  @Length(4, 50)
  @IsNotEmpty()
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 50, required: true })
  doctorPassword: string;
}

export class DoctorLoginResponseDTO {
  @Expose()
  @Type(() => DoctorBaseDTO)
  doctor: DoctorBaseDTO;

  @Expose()
  @IsString()
  accessToken: string;
}

// ─── Doctor Service (pricing) ───────────────────────────

export class CreateDoctorServiceDTO {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({ type: 'string', description: 'e.g. General Consultation', required: true })
  serviceName: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({ type: 'number', description: 'Cost per hour in currency', required: true, example: 50 })
  costPerHour: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  @ApiProperty({ type: 'number', description: 'Duration in hours (1, 2, or custom)', required: true, example: 1 })
  durationHours: number;
}

export class UpdateDoctorServiceDTO extends PartialType(CreateDoctorServiceDTO) { }

export class DoctorServiceResponseDTO {
  @Expose()
  serviceId: number;

  @Expose()
  serviceName: string;

  @Expose()
  costPerHour: number;

  @Expose()
  durationHours: number;

  @Expose()
  totalCost: number;

  @Expose()
  isActive: boolean;

  @Expose()
  doctorId: number;
}

// ─── Consultation ───────────────────────────────────────

export class CreateConsultationDTO {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: 'number', description: 'Service ID used for this consultation' })
  serviceId?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: 'number', description: 'Patient user ID (optional)' })
  userId?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'Start time in ISO format', required: true, example: '2026-05-02T10:00:00Z' })
  startTime: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: 'number', description: 'Custom requested duration in hours (e.g. 1 or 2)' })
  requestedDurationHours?: number;
}

export class CompleteConsultationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'End time in ISO format', required: true, example: '2026-05-02T11:00:00Z' })
  endTime: string;
}

export class UpdateConsultationScheduleDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'New start time in ISO format', required: true, example: '2026-05-03T14:00:00Z' })
  startTime: string;
}

export class UpdateConsultationDurationDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: 'number', description: 'Duration spent in minutes', required: true, example: 30 })
  spentMinutes: number;
}

// ─── Dashboard ──────────────────────────────────────────

export class DashboardResponseDTO {
  @Expose()
  totalEarnings: number;

  @Expose()
  totalConsultationMinutes: number;

  @Expose()
  totalConsultations: number;

  @Expose()
  completedConsultations: number;

  @Expose()
  formattedTime: string; // e.g. "12h 30m"
}
