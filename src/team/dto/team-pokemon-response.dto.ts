import { ApiProperty } from '@nestjs/swagger';

export class TeamPokemonResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Team ID' })
  teamId: string;

  @ApiProperty({ description: 'Pokemon ID' })
  pokemonId: string;

  @ApiProperty({ description: 'Position in team (1-based)', example: 1 })
  position: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
