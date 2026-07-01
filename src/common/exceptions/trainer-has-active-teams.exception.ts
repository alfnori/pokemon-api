import { ConflictException } from '@nestjs/common';

export class TrainerHasActiveTeamsException extends ConflictException {
  constructor(trainerId: string) {
    super(`Trainer ${trainerId} has active teams and cannot be removed`);
  }
}
