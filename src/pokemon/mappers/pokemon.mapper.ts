import { Pokemon } from '../entities/pokemon.entity';
import { PokemonResponseDto } from '../dto/pokemon-response.dto';

export class PokemonMapper {
  static entityToResponse(this: void, entity: Pokemon): PokemonResponseDto {
    return {
      id: entity.id,
      pokeApiId: entity.pokeApiId,
      name: entity.name,
      sprite: entity.sprite,
      height: entity.height,
      weight: entity.weight,
      types: entity.types,
      lastSyncedAt: entity.lastSyncedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static entitiesToResponse(
    this: void,
    entities: Pokemon[],
  ): PokemonResponseDto[] {
    return entities.map(PokemonMapper.entityToResponse);
  }
}
