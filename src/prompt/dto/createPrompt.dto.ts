import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
// import { PromptEntity } from '../entities/prompt.entity';
import { FirstAidDTO } from 'src/first-aid/dto/firstAid.dto';

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
  generatedBy?: 'USER' | 'SYSTEM';

  @Expose()
  triageLevel?: 'HIGH' | 'MEDIUM' | 'LOW';

  @Expose()
  @Type(() => FirstAidDTO)
  firstAid?: FirstAidDTO;

  @Expose()
  hospitalLookupNeeded?: boolean;
}


@Exclude()
export class CreatePromptBackupResponseDTO {
  @Expose()
  generatedBy?: 'USER' | 'SYSTEM';

  @Expose()
  triageLevel?: 'HIGH' | 'MEDIUM' | 'LOW';

  @Expose()
  @Type(() => FirstAidDTO)
  firstAid?: FirstAidDTO;

  @Expose()
  hospitalLookupNeeded?: boolean;

  @Expose()
  message?: string;
}
