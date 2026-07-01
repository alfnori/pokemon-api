import { BadRequestException } from '@nestjs/common';

export class TeamFullException extends BadRequestException {
  constructor(teamId: string) {
    super(`Team ${teamId} already has the maximum of 5 Pokémon`);
  }
}
