import { Injectable } from '@nestjs/common';
import { TrainerDomainService } from './trainer-domain.service';
import { TrainerRepository } from '../repositories/trainer.repository';
import { CepGateway } from '../../cep/gateways/cep.gateway';
import { TrainerNotFoundException } from '../../common/exceptions/trainer-not-found.exception';
import { TrainerResponseDto } from '../dto/trainer-response.dto';
import { TrainerMapper } from '../mappers/trainer.mapper';

@Injectable()
export class TrainerApplicationService {
  constructor(
    private readonly trainerDomainService: TrainerDomainService,
    private readonly trainerRepository: TrainerRepository,
    private readonly cepGateway: CepGateway,
  ) {}

  async create(data: {
    name: string;
    email: string;
    cep: string;
  }): Promise<TrainerResponseDto> {
    const address = await this.cepGateway.searchByCep(data.cep);

    const trainer = this.trainerRepository.create({
      name: data.name,
      email: data.email,
      cep: data.cep,
      street: address.street,
      district: address.district,
      city: address.city,
      state: address.state,
    });

    const saved = await this.trainerRepository.save(trainer);
    return TrainerMapper.entityToResponse(saved);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      cep: string;
    }>,
  ): Promise<TrainerResponseDto> {
    const trainer = await this.trainerRepository.findById(id);

    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }

    if (data.cep && data.cep !== trainer.cep) {
      const address = await this.cepGateway.searchByCep(data.cep);
      Object.assign(trainer, address);
    }

    Object.assign(trainer, data);
    const saved = await this.trainerRepository.save(trainer);
    return TrainerMapper.entityToResponse(saved);
  }

  async findById(id: string): Promise<TrainerResponseDto> {
    const trainer = await this.trainerRepository.findById(id);

    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }

    return TrainerMapper.entityToResponse(trainer);
  }

  async findAll(): Promise<TrainerResponseDto[]> {
    const trainers = await this.trainerRepository.findAll();
    return TrainerMapper.entitiesToResponse(trainers);
  }

  async remove(id: string): Promise<void> {
    await this.trainerDomainService.validateTrainerCanBeRemoved(id);
    await this.trainerRepository.softDelete(id);
  }
}
