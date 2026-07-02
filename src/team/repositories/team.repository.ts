import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamPokemon } from '../entities/team-pokemon.entity';

@Injectable()
export class TeamRepository extends Repository<Team> {
  constructor(
    @InjectRepository(Team)
    repo: Repository<Team>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findById(id: string): Promise<Team | null> {
    return this.findOneBy({ id });
  }

  async findByIdWithTeam(id: string): Promise<Team | null> {
    return this.findOne({
      where: { id },
      relations: { teamPokemons: { pokemon: true } },
    });
  }

  async findByTrainer(trainerId: string): Promise<Team[]> {
    return this.find({ where: { trainerId } });
  }

  async countPokemon(teamId: string): Promise<number> {
    return this.manager.count(TeamPokemon, { where: { teamId } });
  }

  async existsPokemon(teamId: string, pokemonId: string): Promise<boolean> {
    const count = await this.manager.count(TeamPokemon, {
      where: { teamId, pokemonId },
    });
    return count > 0;
  }
}
