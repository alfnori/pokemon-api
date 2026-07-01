import { Team } from '../entities/team.entity';
import { TeamResponseDto } from '../dto/team-response.dto';

export class TeamMapper {
  static entityToResponse(
    this: void,
    entity: Team,
    includePokemons?: boolean,
  ): TeamResponseDto {
    void includePokemons;
    return {
      id: entity.id,
      name: entity.name,
      trainerId: entity.trainerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static entitiesToResponse(this: void, entities: Team[]): TeamResponseDto[] {
    return entities.map((t) => TeamMapper.entityToResponse(t));
  }
}
