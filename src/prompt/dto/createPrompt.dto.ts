import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PromptEntity } from '../entities/prompt.entity';

export class CreatePromptDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @IsOptional()
  @IsEnum(['USER', 'SYSTEM'])
  generatedBy?: 'USER' | 'SYSTEM';
}

@Exclude()
export class CreatePromptResponseDTO {
  @Expose()
  success: boolean;
}
