export interface PokemonData {
  pokeApiId: number;
  name: string;
  sprite: string | null;
  height: number | null;
  weight: number | null;
  types: string[];
}
