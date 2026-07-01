import { Controller } from '@nestjs/common';
import { TrainerApplicationService } from '../services/trainer-application.service';

@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly trainerApplicationService: TrainerApplicationService,
  ) {}
}
