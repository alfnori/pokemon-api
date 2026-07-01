import { Injectable } from '@nestjs/common';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { PokemonNotFoundException } from '../../common/exceptions/pokemon-not-found.exception';

@Injectable()
export class PokemonDomainService {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  async validatePokemonExists(pokeApiId: number): Promise<void> {
    const pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      throw new PokemonNotFoundException(pokeApiId);
    }
  }

  shouldRefresh(lastSyncedAt: Date | null, ttl: number): boolean {
    if (!lastSyncedAt) {
      return true;
    }

    const elapsed = Date.now() - lastSyncedAt.getTime();
    return elapsed > ttl;
  }
}
