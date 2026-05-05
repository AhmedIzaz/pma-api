import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';


export class InitiatePaymentDto {
  @ApiProperty({ type: "number" })
  @IsNotEmpty()
  @IsNumber()
  amount: number;


  @ApiProperty({ type: "number" })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ type: "number" })
  @IsNotEmpty()
  @IsNumber()
  consultationId: number;
}
