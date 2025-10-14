import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService<TEnvironmentVariables>,
  ) {}

  @Get()
  getHello(): string {
    console.log('Server mode: ', this.configService.get('MODE'));
    return this.appService.getHello();
  }
}
