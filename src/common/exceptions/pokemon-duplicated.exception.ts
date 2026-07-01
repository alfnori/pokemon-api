import { ConflictException } from '@nestjs/common';

export class PokemonDuplicatedException extends ConflictException {
  constructor(teamId: string, pokemonId: string) {
    super(`Pokémon ${pokemonId} is already in team ${teamId}`);
  }
}
