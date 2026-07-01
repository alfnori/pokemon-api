export class PokemonResponseDto {
  id: string;
  pokeApiId: number;
  name: string;
  sprite: string | null;
  height: number | null;
  weight: number | null;
  types: string[] | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
