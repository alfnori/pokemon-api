import { IsInt, Min } from 'class-validator';

export class AddPokemonToTeamDto {
  @IsInt()
  @Min(1)
  pokemonId: number;
}
