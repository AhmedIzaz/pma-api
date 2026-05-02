import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('doctor')
export class DoctorViewController {
  private readonly apiBase = process.env.API_BASE || '';

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
}
