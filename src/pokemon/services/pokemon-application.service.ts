import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PokemonDomainService } from './pokemon-domain.service';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { PokemonGateway } from './pokemon.gateway';
import { TeamDomainService } from '../../team/services/team-domain.service';
import { TeamPokemonRepository } from '../../team/repositories/team-pokemon.repository';
import { TeamRepository } from '../../team/repositories/team.repository';
import { TeamNotFoundException } from '../../common/exceptions/team-not-found.exception';
import { TeamFullException } from '../../common/exceptions/team-full.exception';
import { PokemonDuplicatedException } from '../../common/exceptions/pokemon-duplicated.exception';
import { PokemonNotFoundException } from '../../common/exceptions/pokemon-not-found.exception';
import { PokemonNotInTeamException } from '../../common/exceptions/pokemon-not-in-team.exception';
import { Pokemon } from '../entities/pokemon.entity';
import { TeamPokemon } from '../../team/entities/team-pokemon.entity';
import { PokemonResponseDto } from '../dto/pokemon-response.dto';
import { AddPokemonResponseDto } from '../../team/dto/add-pokemon-response.dto';

@Injectable()
export class PokemonApplicationService {
  private readonly cacheTtl: number;
  private readonly maxTeamSize: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly pokemonDomainService: PokemonDomainService,
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokemonGateway: PokemonGateway,
    private readonly teamDomainService: TeamDomainService,
    private readonly teamPokemonRepository: TeamPokemonRepository,
    private readonly teamRepository: TeamRepository,
    configService: ConfigService,
  ) {
    this.cacheTtl =
      configService.get<number>('pokemon.cacheTtl', 604800) * 1000;
    this.maxTeamSize = configService.get<number>('team.maxSize', 5);
  }

  async addToTeam(
    teamId: string,
    pokeApiId: number,
  ): Promise<AddPokemonResponseDto> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new TeamNotFoundException(teamId);
    }

    let pokemon = await this.pokemonRepository.findByPokeApiId(pokeApiId);

    if (!pokemon) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.create(apiData);
    } else if (
      this.pokemonDomainService.shouldRefresh(
        pokemon.lastSyncedAt,
        this.cacheTtl,
      )
    ) {
      const apiData = await this.pokemonGateway.fetchPokemon(pokeApiId);
      pokemon = this.pokemonRepository.merge(pokemon, apiData);
      pokemon.lastSyncedAt = new Date();
    }

    return this.dataSource.transaction(async (manager) => {
      const currentCount = await manager.count(TeamPokemon, {
        where: { teamId },
      });

      if (currentCount >= this.maxTeamSize) {
        throw new TeamFullException(teamId, this.maxTeamSize);
      }

      const existing = await manager.findOneBy(TeamPokemon, {
        teamId,
        pokemonId: pokemon.id,
      });

      if (existing) {
        throw new PokemonDuplicatedException(teamId, pokemon.id);
      }

      const savedPokemon = await manager.save(Pokemon, pokemon);

      const teamPokemon = manager.create(TeamPokemon, {
        teamId,
        pokemonId: savedPokemon.id,
        position: currentCount + 1,
      });
      await manager.save(TeamPokemon, teamPokemon);

      return {
        position: teamPokemon.position!,
        pokemon: savedPokemon,
      };
    });
  }

  async removeFromTeam(teamId: string, pokemonId: string): Promise<void> {
    const teamPokemon = await this.teamPokemonRepository.findByTeamAndPokemon(
      teamId,
      pokemonId,
    );

    if (!teamPokemon) {
      throw new PokemonNotInTeamException(teamId, pokemonId);
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
