import { Injectable } from '@nestjs/common';
import { TrainerRepository } from '../repositories/trainer.repository';
import { TrainerNotFoundException } from '../../common/exceptions/trainer-not-found.exception';
import { TrainerHasActiveTeamsException } from '../../common/exceptions/trainer-has-active-teams.exception';

@Injectable()
export class TrainerDomainService {
  constructor(private readonly trainerRepository: TrainerRepository) {}

  async validateTrainerCanBeRemoved(trainerId: string): Promise<void> {
    const trainer = await this.trainerRepository.findWithTeams(trainerId);

    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    if (trainer.teams && trainer.teams.length > 0) {
      throw new TrainerHasActiveTeamsException(trainerId);
    }
  }
}
