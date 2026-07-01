import { NotFoundException } from '@nestjs/common';

export class PokemonNotFoundException extends NotFoundException {
  constructor(pokeApiId: number) {
    super(`Pokémon with PokéAPI id ${pokeApiId} not found`);
  }
}
