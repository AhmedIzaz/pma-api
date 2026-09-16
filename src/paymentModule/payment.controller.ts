import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './payment.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('doctor/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  // @ApiBody({ type: InitiatePaymentDto })
  @Post('initiate')
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
  }

  @Post('success')
  async handleSuccess(@Body() body: any) {
    return this.paymentService.handleSuccess(body);
  }

  @Post('fail')
  async handleFail(@Body() body: any) {
    return this.paymentService.handleFail(body);
  }

  @Post('cancel')
  async handleCancel(@Body() body: any) {
    return this.paymentService.handleCancel(body);
  }

  @Post('ipn')
  async handleIpn(@Body() body: any) {
    return this.paymentService.handleIpn(body);
  }

  @Get('status/:tran_id')
  async getPaymentStatus(@Param('tran_id') tran_id: string) {
    return this.paymentService.getPaymentStatus(tran_id);
  }
}
