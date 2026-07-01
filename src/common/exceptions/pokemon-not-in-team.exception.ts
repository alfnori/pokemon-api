import { NotFoundException } from '@nestjs/common';

export class PokemonNotInTeamException extends NotFoundException {
  constructor(teamId: string, pokemonId: string) {
    super(`Pokémon ${pokemonId} is not in team ${teamId}`);
  }
}
