import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPokemonToTeamDto {
  @ApiProperty({
    description: 'PokéAPI ID of the Pokémon',
    example: 25,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  pokemonId: number;
}
