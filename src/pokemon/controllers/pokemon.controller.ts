import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { PokemonApplicationService } from '../services/pokemon-application.service';
import { PokemonResponseDto } from '../dto/pokemon-response.dto';

@Controller('pokemons')
export class PokemonController {
  constructor(
    private readonly pokemonApplicationService: PokemonApplicationService,
  ) {}

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PokemonResponseDto> {
    return this.pokemonApplicationService.getById(id);
  }

  @Post(':id/refresh')
  async refresh(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PokemonResponseDto> {
    return this.pokemonApplicationService.refresh(id);
  }
}
