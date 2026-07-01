import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PokemonDomainService } from './pokemon-domain.service';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { PokemonGateway } from './pokemon.gateway';
import { TeamDomainService } from '../../team/services/team-domain.service';
import { TeamPokemonRepository } from '../../team/repositories/team-pokemon.repository';
import { PokemonNotFoundException } from '../../common/exceptions/pokemon-not-found.exception';
import { PokemonResponseDto } from '../dto/pokemon-response.dto';

@Injectable()
export class PokemonApplicationService {
  private readonly cacheTtl: number;

  constructor(
    private readonly pokemonDomainService: PokemonDomainService,
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokemonGateway: PokemonGateway,
    private readonly teamDomainService: TeamDomainService,
    private readonly teamPokemonRepository: TeamPokemonRepository,
    configService: ConfigService,
  ) {
    this.cacheTtl =
      configService.get<number>('pokemon.cacheTtl', 604800) * 1000;
  }

  async addToTeam(
    teamId: string,
    pokeApiId: number,
  ): Promise<PokemonResponseDto> {
    await this.teamDomainService.validateTeamLimit(teamId);

    let pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.create(apiData);
      pokemon = await this.pokemonRepository.save(pokemon);
    } else if (
      this.pokemonDomainService.shouldRefresh(
        pokemon.lastSyncedAt,
        this.cacheTtl,
      )
    ) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.merge(pokemon, apiData);
      pokemon.lastSyncedAt = new Date();
      pokemon = await this.pokemonRepository.save(pokemon);
    }

    await this.teamDomainService.validateDuplicatePokemon(teamId, pokemon.id);

    const teamPokemon = this.teamPokemonRepository.create({
      teamId,
      pokemonId: pokemon.id,
    });
    await this.teamPokemonRepository.save(teamPokemon);

    return pokemon;
  }

  async removeFromTeam(teamId: string, pokemonId: string): Promise<void> {
    const teamPokemon = await this.teamPokemonRepository.findByTeamAndPokemon(
      teamId,
      pokemonId,
    );

    if (!teamPokemon) {
      throw new NotFoundException('Pokémon not found in this team');
    }

    await this.teamPokemonRepository.remove(teamPokemon);
  }

  async getById(pokeApiId: number): Promise<PokemonResponseDto> {
    const pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      throw new PokemonNotFoundException(pokeApiId);
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

    return this.pokemonRepository.updateSync(pokemon);
  }
}
