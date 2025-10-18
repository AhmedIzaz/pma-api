import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor() {}

  @Get('/hello')
  async hello() {
    return 'Hello from user controller';
  }
}
