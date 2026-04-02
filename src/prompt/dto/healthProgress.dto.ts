import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class HealthProgressQueryDTO {
  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly'], default: 'weekly' })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  period?: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

@Exclude()
class TriageCountsDTO {
  @Expose()
  HIGH: number;

  @Expose()
  MEDIUM: number;

  @Expose()
  LOW: number;
}

@Exclude()
class DeltaDTO {
  @Expose()
  direction: 'IMPROVING' | 'WORSENING' | 'STABLE';

  @Expose()
  change: number;
}

@Exclude()
class TimelineEntryDTO {
  @Expose()
  date: string;

  @Expose()
  severityScore: number;

  @Expose()
  @Type(() => TriageCountsDTO)
  triageCounts: TriageCountsDTO;

  @Expose()
  totalPrompts: number;

  @Expose()
  hospitalLookupCount: number;

  @Expose()
  @Type(() => DeltaDTO)
  delta?: DeltaDTO;
}

@Exclude()
class HealthProgressSummaryDTO {
  @Expose()
  totalInteractions: number;

  @Expose()
  averageSeverity: 'HIGH' | 'MEDIUM' | 'LOW';

  @Expose()
  overallDelta: 'IMPROVING' | 'WORSENING' | 'STABLE';

  @Expose()
  periodStart?: string;

  @Expose()
  periodEnd?: string;
}

@Exclude()
export class HealthProgressResponseDTO {
  @Expose()
  @Type(() => HealthProgressSummaryDTO)
  summary: HealthProgressSummaryDTO;

  @Expose()
  @Type(() => TimelineEntryDTO)
  timeline: TimelineEntryDTO[];

  @Expose()
  @Type(() => TriageCountsDTO)
  frequencyMap: TriageCountsDTO;
}
