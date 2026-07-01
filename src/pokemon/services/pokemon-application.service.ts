import { Injectable } from '@nestjs/common';
import { PokemonDomainService } from './pokemon-domain.service';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { PokemonGateway } from './pokemon.gateway';

@Injectable()
export class PokemonApplicationService {
  constructor(
    private readonly pokemonDomainService: PokemonDomainService,
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokemonGateway: PokemonGateway,
  ) {}
}
