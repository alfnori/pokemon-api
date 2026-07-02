import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TeamDomainService } from './team-domain.service';
import { TeamRepository } from '../repositories/team.repository';
import { TeamPokemonRepository } from '../repositories/team-pokemon.repository';
import { PokemonDomainService } from '../../pokemon/services/pokemon-domain.service';
import { PokemonRepository } from '../../pokemon/repositories/pokemon.repository';
import { PokemonGateway } from '../../pokemon/services/pokemon.gateway';
import { TeamResponseDto } from '../dto/team-response.dto';
import { AddPokemonResponseDto } from '../dto/add-pokemon-response.dto';
import { TeamNotFoundException } from '../../common/exceptions/team-not-found.exception';
import { TeamFullException } from '../../common/exceptions/team-full.exception';
import { PokemonDuplicatedException } from '../../common/exceptions/pokemon-duplicated.exception';
import { PokemonNotInTeamException } from '../../common/exceptions/pokemon-not-in-team.exception';
import { Pokemon } from '../../pokemon/entities/pokemon.entity';
import { TeamPokemon } from '../entities/team-pokemon.entity';
import { TeamMapper } from '../mappers/team.mapper';
import { PokemonMapper } from '../../pokemon/mappers/pokemon.mapper';

@Injectable()
export class TeamApplicationService {
  private readonly cacheTtl: number;
  private readonly maxTeamSize: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly teamDomainService: TeamDomainService,
    private readonly teamRepository: TeamRepository,
    private readonly teamPokemonRepository: TeamPokemonRepository,
    private readonly pokemonDomainService: PokemonDomainService,
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokemonGateway: PokemonGateway,
    configService: ConfigService,
  ) {
    this.cacheTtl =
      configService.get<number>('pokemon.cacheTtl', 604800) * 1000;
    this.maxTeamSize = configService.get<number>('team.maxSize', 5);
  }

  async addPokemon(
    teamId: string,
    pokeApiId: number,
  ): Promise<AddPokemonResponseDto> {
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

      const savedPokemon = await manager.save(Pokemon, pokemon);

      const existing = await manager.findOneBy(TeamPokemon, {
        teamId,
        pokemonId: savedPokemon.id,
      });

      if (existing) {
        throw new PokemonDuplicatedException(teamId, savedPokemon.id);
      }

      const teamPokemon = manager.create(TeamPokemon, {
        teamId,
        pokemonId: savedPokemon.id,
        position: currentCount + 1,
      });
      await manager.save(TeamPokemon, teamPokemon);

      return {
        position: teamPokemon.position!,
        pokemon: PokemonMapper.entityToResponse(savedPokemon),
      };
    });
  }

  async removePokemon(teamId: string, pokemonId: string): Promise<void> {
    const teamPokemon = await this.teamPokemonRepository.findByTeamAndPokemon(
      teamId,
      pokemonId,
    );

    if (!teamPokemon) {
      throw new PokemonNotInTeamException(teamId, pokemonId);
    }

    await this.teamPokemonRepository.remove(teamPokemon);
  }

  async create(data: {
    name: string;
    trainerId: string;
  }): Promise<TeamResponseDto> {
    const team = this.teamRepository.create({
      name: data.name,
      trainerId: data.trainerId,
    });

    const saved = await this.teamRepository.save(team);
    return TeamMapper.entityToResponse(saved);
  }

  async findById(id: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(id);

    if (!team) {
      throw new TeamNotFoundException(id);
    }

    return TeamMapper.entityToResponse(team);
  }

  async findAll(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.find();
    return TeamMapper.entitiesToResponse(teams);
  }

  async remove(id: string): Promise<void> {
    const team = await this.teamRepository.findById(id);

    if (!team) {
      throw new TeamNotFoundException(id);
    }

    await this.teamRepository.remove(team);
  }
}
