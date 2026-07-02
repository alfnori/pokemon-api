import { ApiProperty } from '@nestjs/swagger';
import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';

export class TeamPokemonEntryDto {
  @ApiProperty({ description: 'Position in team (1-based)', example: 1 })
  position: number;

  @ApiProperty({ description: 'Pokémon data' })
  pokemon: PokemonResponseDto;
}
