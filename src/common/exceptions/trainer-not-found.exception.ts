import { NotFoundException } from '@nestjs/common';

export class TrainerNotFoundException extends NotFoundException {
  constructor(trainerId: string) {
    super(`Trainer with id ${trainerId} not found`);
  }
}
