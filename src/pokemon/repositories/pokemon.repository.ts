import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from '../entities/pokemon.entity';

@Injectable()
export class PokemonRepository {
  constructor(
    @InjectRepository(Pokemon)
    private readonly repo: Repository<Pokemon>,
  ) {}
}
