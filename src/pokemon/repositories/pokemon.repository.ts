import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from '../entities/pokemon.entity';

@Injectable()
export class PokemonRepository extends Repository<Pokemon> {
  constructor(
    @InjectRepository(Pokemon)
    repo: Repository<Pokemon>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findById(id: string): Promise<Pokemon | null> {
    return this.findOneBy({ id });
  }

  async findByPokeApiId(pokeApiId: number): Promise<Pokemon | null> {
    return this.findOneBy({ pokeApiId });
  }

  async findStale(cutoff: Date): Promise<Pokemon[]> {
    return this.createQueryBuilder('pokemon')
      .where(
        'pokemon.last_synced_at IS NULL OR pokemon.last_synced_at < :cutoff',
        { cutoff },
      )
      .getMany();
  }

  async updateSync(pokemon: Pokemon): Promise<Pokemon> {
    pokemon.lastSyncedAt = new Date();
    return this.save(pokemon);
  }
}
