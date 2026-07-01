import { Trainer } from '../entities/trainer.entity';
import { TrainerResponseDto } from '../dto/trainer-response.dto';

export class TrainerMapper {
  static entityToResponse(this: void, entity: Trainer): TrainerResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      cep: entity.cep,
      street: entity.street,
      district: entity.district,
      city: entity.city,
      state: entity.state,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static entitiesToResponse(
    this: void,
    entities: Trainer[],
  ): TrainerResponseDto[] {
    return entities.map(TrainerMapper.entityToResponse);
  }
}
