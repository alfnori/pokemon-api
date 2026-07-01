import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamPokemon } from '../entities/team-pokemon.entity';

@Injectable()
export class TeamPokemonRepository extends Repository<TeamPokemon> {
  constructor(
    @InjectRepository(TeamPokemon)
    repo: Repository<TeamPokemon>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findByTeamAndPokemon(
    teamId: string,
    pokemonId: string,
  ): Promise<TeamPokemon | null> {
    return this.findOneBy({ teamId, pokemonId });
  }
}
