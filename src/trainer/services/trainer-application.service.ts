import { Injectable } from '@nestjs/common';
import { TrainerDomainService } from './trainer-domain.service';
import { TrainerRepository } from '../repositories/trainer.repository';

@Injectable()
export class TrainerApplicationService {
  constructor(
    private readonly trainerDomainService: TrainerDomainService,
    private readonly trainerRepository: TrainerRepository,
  ) {}
}
