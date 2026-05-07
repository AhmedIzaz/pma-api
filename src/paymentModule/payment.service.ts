import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { PaymentEntity, TPaymentStatusEnum } from './payment.entity';
import { InitiatePaymentDto } from './payment.dto';
import { UserService } from 'src/userModule/user.service';
import { DoctorService } from 'src/doctorModule/doctor.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,

  ) { }

  private getSslCredentials() {
    const storeIdBase64 = this.configService.get<string>('SSL_STORE_ID');
    const storePassBase64 = this.configService.get<string>('SSL_STORE_NAME');
    const baseUrl = this.configService.get<string>('SSL_BASE_URL');
    let domain = this.configService.get<string>('DOMAIN');

    if (!domain) {
      domain = 'localhost:8000';
    }

    const store_id = storeIdBase64 ? Buffer.from(storeIdBase64, 'base64').toString('utf-8') : '';
    const store_passwd = storePassBase64 ? Buffer.from(storePassBase64, 'base64').toString('utf-8') : '';

    return { store_id, store_passwd, baseUrl, domain };
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    const { amount, userId, consultationId } = dto;

    const user = await this.userService.findUserById(userId);

    if (!user?.userId) {
      throw new NotFoundException('User not found');
    }

    const consultation = await this.doctorService.getConsultationById(consultationId);

    if (!consultation?.consultationId) {
      throw new NotFoundException('Consultation not found');
    }

    const tran_id = uuidv4();
    const currency = 'BDT';

    const { store_id, store_passwd, baseUrl, domain } = this.getSslCredentials();

    // Store in DB as INIT
    const payment = this.paymentRepository.create({
      tran_id,
      amount,
      currency,
      status: TPaymentStatusEnum.INIT,
      user_id: userId,
      consultationId,
    });
    await this.paymentRepository.save(payment);

    // Prepare SSLCommerz Payload
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const apiBase = this.configService.get<string>('API_BASE') || '';

    // We use URLSearchParams because SSLCommerz expects application/x-www-form-urlencoded
    const payload = new URLSearchParams();
    payload.append('store_id', store_id);
    payload.append('store_passwd', store_passwd);
    payload.append('total_amount', amount.toString());
    payload.append('currency', currency);
    payload.append('tran_id', tran_id);
    payload.append('success_url', `${protocol}://${domain}/${apiBase}/doctor/payments/success`);
    payload.append('fail_url', `${protocol}://${domain}/${apiBase}/doctor/payments/fail`);
    payload.append('cancel_url', `${protocol}://${domain}/${apiBase}/doctor/payments/cancel`);
    payload.append('ipn_url', `${protocol}://${domain}/${apiBase}/doctor/payments/ipn`);
    payload.append('cus_name', `User ${userId}`);
    payload.append('cus_email', `user${userId}@example.com`);
    payload.append('cus_add1', 'Dhaka');
    payload.append('cus_city', 'Dhaka');
    payload.append('cus_state', 'Dhaka');
    payload.append('cus_postcode', '1000');
    payload.append('cus_country', 'Bangladesh');
    payload.append('cus_phone', '01711111111');
    payload.append('shipping_method', 'NO');
    payload.append('num_of_item', '1');
    payload.append('product_name', 'Medical Consultation');
    payload.append('product_category', 'Service');
    payload.append('product_profile', 'general');

    try {
      this.logger.log(`Initiating payment for tran_id: ${tran_id}`);
      const response = await axios.post(`${baseUrl}/gwprocess/v4/api.php`, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data && response.data.status === 'SUCCESS') {
        return {
          GatewayPageURL: response.data.GatewayPageURL,
          tran_id,
        };
      } else {
        this.logger.error(`SSLCommerz init failed: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException('Payment initiation failed');
      }
    } catch (error) {
      this.logger.error(`Error initiating payment: ${error.message}`);
      throw new InternalServerErrorException('Error initiating payment');
    }
  }

  async validatePayment(val_id: string): Promise<boolean> {
    const { store_id, store_passwd, baseUrl } = this.getSslCredentials();
    try {
      const response = await axios.get(`${baseUrl}/validator/api/validationserverAPI.php`, {
        params: {
          val_id,
          store_id,
          store_passwd,
          v: 1,
          format: 'json',
        },
      });

      const data = response.data;

      // Extract transaction from db
      const tran_id = data.tran_id;
      const payment = await this.paymentRepository.findOne({ where: { tran_id } });

      if (!payment) {
        this.logger.warn(`Payment not found for tran_id: ${tran_id}`);
        return false;
      }

      // Check idempotency
      if (payment.status !== TPaymentStatusEnum.INIT) {
        this.logger.log(`Payment already processed for tran_id: ${tran_id}`);
        return payment.status === TPaymentStatusEnum.SUCCESS;
      }

      payment.raw_response = data;
      payment.val_id = val_id;

      if (
        data.status === 'VALID' ||
        data.status === 'VALIDATED'
      ) {
        // Validate amount and currency
        if (parseFloat(data.amount) === parseFloat(payment.amount.toString()) && data.currency === payment.currency) {
          payment.status = TPaymentStatusEnum.SUCCESS;
          await this.paymentRepository.save(payment);
          return true;
        } else {
          this.logger.error('Amount or currency mismatch during validation');
          payment.status = TPaymentStatusEnum.FAILED;
          await this.paymentRepository.save(payment);
          return false;
        }
      } else {
        payment.status = TPaymentStatusEnum.FAILED;
        await this.paymentRepository.save(payment);
        return false;
      }
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  async handleSuccess(body: any) {
    const { val_id, tran_id } = body;
    this.logger.log(`Handling success for tran_id: ${tran_id}`);

    if (val_id) {
      await this.validatePayment(val_id);
    }

    return {
      message: 'Payment Success. You can close this window.',
      tran_id
    };
  }

  async handleFail(body: any) {
    const { tran_id } = body;
    this.logger.log(`Handling fail for tran_id: ${tran_id}`);

    const payment = await this.paymentRepository.findOne({ where: { tran_id } });
    if (payment && payment.status === TPaymentStatusEnum.INIT) {
      payment.status = TPaymentStatusEnum.FAILED;
      payment.raw_response = body;
      await this.paymentRepository.save(payment);
    }

    return {
      message: 'Payment Failed. You can close this window.',
      tran_id
    };
  }

  async handleCancel(body: any) {
    const { tran_id } = body;
    this.logger.log(`Handling cancel for tran_id: ${tran_id}`);

    const payment = await this.paymentRepository.findOne({ where: { tran_id } });
    if (payment && payment.status === TPaymentStatusEnum.INIT) {
      payment.status = TPaymentStatusEnum.CANCELLED;
      payment.raw_response = body;
      await this.paymentRepository.save(payment);
    }

    return {
      message: 'Payment Cancelled. You can close this window.',
      tran_id
    };
  }

  async handleIpn(body: any) {
    this.logger.log(`IPN received for tran_id: ${body?.tran_id}`);
    const { val_id } = body;
    if (val_id) {
      await this.validatePayment(val_id);
    }
    return { message: 'IPN Processed' };
  }

  async getPaymentStatus(tran_id: string) {
    const payment = await this.paymentRepository.findOne({ where: { tran_id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return {
      tran_id: payment.tran_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      consultationId: payment.consultationId,
    };
  }
}
