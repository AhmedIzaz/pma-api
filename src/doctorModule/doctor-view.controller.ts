import { Controller, Get, NotFoundException, Param, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { ConfigService } from '@nestjs/config';

@ApiExcludeController()
@Controller('doctor')
export class DoctorViewController {
  private readonly apiBase = process.env.API_BASE || '';
  constructor(
    private readonly doctorService: DoctorService,
    private readonly configService: ConfigService,
  ) { }

  @Get('/login')
  @Render('doctor/login')
  loginPage() {
    return {
      apiBase: this.apiBase,
    };
  }

  @Get('/signup')
  @Render('doctor/signup')
  signupPage() {
    return {
      apiBase: this.apiBase,
    };
  }

  @Get('/dashboard')
  @Render('doctor/dashboard')
  dashboardPage() {
    return {
      apiBase: this.apiBase,
    };
  }

  @Get('/services')
  @Render('doctor/services')
  servicesPage() {
    return {
      apiBase: this.apiBase,
    };
  }

  @Get('/consultations')
  @Render('doctor/consultations')
  consultationsPage() {
    return {
      apiBase: this.apiBase,
    };
  }

  @Get('/conference/:consultationId')
  @Render('doctor/conference')
  async conferencePage(@Param('consultationId') consultationId: string) {
    const consultation = await this.doctorService.getConsultationById(Number(consultationId));
    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${consultationId} not found`);
    }
    const base64AppId = this.configService.get<string>('ZIGO_APP_ID');
    const base64ServerSecret = this.configService.get<string>('ZIGO_SERVER_SECRET');

    if (!base64AppId || !base64ServerSecret) {
      throw new Error('ZIGO_APP_ID or ZIGO_SERVER_SECRET not configured');
    }

    const appId = Buffer.from(base64AppId, 'base64').toString('utf-8')?.replace('\n', '');
    const serverSecret = Buffer.from(base64ServerSecret, 'base64').toString('utf-8')?.replace('\n', '');

    const doctorId = consultation?.doctorId;
    if (!doctorId) {
      throw new NotFoundException(`Doctor ID not found for consultation with ID ${consultationId}`);
    }


    return {
      apiBase: this.apiBase,
      consultationId,
      appId,
      serverSecret,
      doctorId,
      doctorName: consultation.doctor?.doctorName,
    };
  }
}
