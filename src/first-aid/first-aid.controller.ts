import { Controller,  } from '@nestjs/common';
import { FirstAidService } from './first-aid.service';

@Controller('first-aid')
export class FirstAidController {
  constructor(private readonly firstAidService: FirstAidService) {}

}
