import { NotFoundException } from '@nestjs/common';

export class TeamNotFoundException extends NotFoundException {
  constructor(teamId: string) {
    super(`Team with id ${teamId} not found`);
  }
}
