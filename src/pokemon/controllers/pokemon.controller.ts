import { Controller } from '@nestjs/common';
import { PokemonApplicationService } from '../services/pokemon-application.service';

@Controller('pokemons')
export class PokemonController {
  constructor(
    private readonly pokemonApplicationService: PokemonApplicationService,
  ) {}
}
