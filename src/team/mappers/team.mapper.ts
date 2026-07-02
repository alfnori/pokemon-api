import { Team } from '../entities/team.entity';
import { TeamResponseDto } from '../dto/team-response.dto';
import { TeamPokemonEntryDto } from '../dto/team-pokemon-entry.dto';
import { PokemonMapper } from '../../pokemon/mappers/pokemon.mapper';

export class TeamMapper {
  static entityToResponse(
    this: void,
    entity: Team,
    includePokemons?: boolean,
  ): TeamResponseDto {
    const pokemons: TeamPokemonEntryDto[] =
      includePokemons && entity.teamPokemons
        ? entity.teamPokemons
            .filter((tp) => tp.pokemon)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((tp) => ({
              position: tp.position ?? 0,
              pokemon: PokemonMapper.entityToResponse(tp.pokemon),
            }))
        : [];

    return {
      id: entity.id,
      name: entity.name,
      trainerId: entity.trainerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      pokemons,
    };
  }

  static entitiesToResponse(this: void, entities: Team[]): TeamResponseDto[] {
    return entities.map((t) => TeamMapper.entityToResponse(t, false));
  }
}
