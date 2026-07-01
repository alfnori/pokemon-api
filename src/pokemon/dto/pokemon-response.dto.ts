import { ApiProperty } from '@nestjs/swagger';

export class PokemonResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'PokéAPI ID', example: 25 })
  pokeApiId: number;

  @ApiProperty({ description: 'Pokémon name', example: 'pikachu' })
  name: string;

  @ApiProperty({ description: 'Sprite URL', nullable: true, example: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' })
  sprite: string | null;

  @ApiProperty({ description: 'Height (decimeters)', nullable: true, example: 4 })
  height: number | null;

  @ApiProperty({ description: 'Weight (hectograms)', nullable: true, example: 60 })
  weight: number | null;

  @ApiProperty({ description: 'Pokémon types', nullable: true, example: ['electric'] })
  types: string[] | null;

  @ApiProperty({ description: 'Last sync timestamp with PokéAPI', nullable: true })
  lastSyncedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
