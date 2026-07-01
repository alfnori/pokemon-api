import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';

export class AddPokemonResponseDto {
  position: number;
  pokemon: PokemonResponseDto;
}
