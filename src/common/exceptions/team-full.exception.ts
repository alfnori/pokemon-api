import { BadRequestException } from '@nestjs/common';

export class TeamFullException extends BadRequestException {
  constructor(teamId: string, maxSize: number = 5) {
    super(`Team ${teamId} already has the maximum of ${maxSize} Pokémon`);
  }
}
