import { Injectable } from '@nestjs/common';
import { TeamDomainService } from './team-domain.service';
import { TeamRepository } from '../repositories/team.repository';
import { TeamPokemonRepository } from '../repositories/team-pokemon.repository';
import { TeamResponseDto } from '../dto/team-response.dto';
import { TeamNotFoundException } from '../../common/exceptions/team-not-found.exception';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class TeamApplicationService {
  constructor(
    private readonly teamDomainService: TeamDomainService,
    private readonly teamRepository: TeamRepository,
    private readonly teamPokemonRepository: TeamPokemonRepository,
  ) {}

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
