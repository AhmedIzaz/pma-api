import { Controller } from '@nestjs/common';
import { SymptomService } from './symptom.service';

@Controller('symptom')
export class SymptomController {
  constructor(private readonly symptomService: SymptomService) {}
}
