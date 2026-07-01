import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TeamRepository } from '../repositories/team.repository';
import { TeamNotFoundException } from '../../common/exceptions/team-not-found.exception';
import { TeamFullException } from '../../common/exceptions/team-full.exception';
import { PokemonDuplicatedException } from '../../common/exceptions/pokemon-duplicated.exception';

@Injectable()
export class TeamDomainService {
  private readonly maxTeamSize: number;

  constructor(
    private readonly teamRepository: TeamRepository,
    configService: ConfigService,
  ) {
    this.maxTeamSize = configService.get<number>('team.maxSize', 5);
  }

  async validateTeamLimit(teamId: string): Promise<void> {
    const count = await this.teamRepository.countPokemon(teamId);

    if (count >= this.maxTeamSize) {
      throw new TeamFullException(teamId);
    }
  }

  async validateDuplicatePokemon(
    teamId: string,
    pokemonId: string,
  ): Promise<void> {
    const exists = await this.teamRepository.existsPokemon(teamId, pokemonId);

    if (exists) {
      throw new PokemonDuplicatedException(teamId, pokemonId);
    }
  }

  async validateTeamOwnership(
    teamId: string,
    trainerId: string,
  ): Promise<void> {
    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new TeamNotFoundException(teamId);
    }

    if (team.trainerId !== trainerId) {
      throw new TeamNotFoundException(teamId);
    }
  }
}
