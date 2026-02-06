import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { FirstAidDTO } from 'src/first-aid/dto/firstAid.dto';

export class GetPromptQueryDTO {

    @ApiProperty({ nullable: true, required: false })
    @IsOptional()
    @IsString()
    // @Min(0)
    @Type(() => String) // Necessary for transformation to number type
    afterCursor?: string;

    @ApiProperty()
    @IsNumber()
    @Max(1000000)
    @Type(() => Number) // Necessary for transformation to number type
    limit: number;
}

@Exclude()
export class GetPromptsResponseDTO {
    @Expose()
    @Type(() => GetPromptsResponseDataDTO)
    data: GetPromptsResponseDataDTO[];

    @Expose()
    nextCursor?:string
}

@Exclude()
class GetPromptsResponseDataDTO {
    @Expose()
    id: string;

    @Expose()
    generatedBy: 'USER' | 'SYSTEM';

    @Expose()
    text?: string; // only for user

    @Expose()
    triageLevel?: 'HIGH' | 'MEDIUM' | 'LOW';

    @Expose()
    @Type(() => FirstAidDTO)
    firstAid?: FirstAidDTO;

    @Expose()
    hospitalLookupNeeded?: boolean;

    @Expose()
    dateInfo: any;
}
