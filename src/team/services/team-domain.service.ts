import { Injectable } from '@nestjs/common';
import { TeamRepository } from '../repositories/team.repository';
import { TeamNotFoundException } from '../../common/exceptions/team-not-found.exception';
import { TeamFullException } from '../../common/exceptions/team-full.exception';
import { PokemonDuplicatedException } from '../../common/exceptions/pokemon-duplicated.exception';

@Injectable()
export class TeamDomainService {
  constructor(private readonly teamRepository: TeamRepository) {}

  async validateTeamLimit(teamId: string, maxSize: number): Promise<void> {
    const count = await this.teamRepository.countPokemon(teamId);

    if (count >= maxSize) {
      throw new TeamFullException(teamId, maxSize);
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
