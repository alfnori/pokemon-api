import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamPokemon } from '../entities/team-pokemon.entity';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  async findById(id: string): Promise<Team | null> {
    return this.repo.findOneBy({ id });
  }

  async countPokemon(teamId: string): Promise<number> {
    return this.repo.manager.count(TeamPokemon, { where: { teamId } });
  }

  async existsPokemon(teamId: string, pokemonId: string): Promise<boolean> {
    const count = await this.repo.manager.count(TeamPokemon, {
      where: { teamId, pokemonId },
    });
    return count > 0;
  }
}
