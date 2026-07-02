import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PokemonDomainService } from './pokemon-domain.service';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { PokemonGateway } from './pokemon.gateway';
import { PokemonNotFoundException } from '../../common/exceptions/pokemon-not-found.exception';
import { Pokemon } from '../entities/pokemon.entity';
import { PokemonResponseDto } from '../dto/pokemon-response.dto';
import { PokemonMapper } from '../mappers/pokemon.mapper';

@Injectable()
export class PokemonApplicationService {
  private readonly cacheTtl: number;

  constructor(
    private readonly pokemonDomainService: PokemonDomainService,
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokemonGateway: PokemonGateway,
    configService: ConfigService,
  ) {
    this.cacheTtl =
      configService.get<number>('pokemon.cacheTtl', 604800) * 1000;
  }

  async getById(pokeApiId: number): Promise<PokemonResponseDto> {
    const pokemon = await this.resolvePokemonOrFetch(pokeApiId);
    return PokemonMapper.entityToResponse(pokemon);
  }

  private async resolvePokemonOrFetch(pokeApiId: number): Promise<Pokemon> {
    let pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.create(apiData);
      return this.pokemonRepository.save(pokemon);
    }

    if (
      this.pokemonDomainService.shouldRefresh(
        pokemon.lastSyncedAt,
        this.cacheTtl,
      )
    ) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.merge(pokemon, apiData);
      return this.pokemonRepository.updateSync(pokemon);
    }

    return pokemon;
  }

  async refresh(pokeApiId: number): Promise<PokemonResponseDto> {
    const pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      throw new PokemonNotFoundException(pokeApiId);
    }

    const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
    Object.assign(pokemon, apiData);

    const updated = await this.pokemonRepository.updateSync(pokemon);
    return PokemonMapper.entityToResponse(updated);
  }
}
