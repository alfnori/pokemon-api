import { Injectable } from '@nestjs/common';
import { TrainerDomainService } from './trainer-domain.service';
import { TrainerRepository } from '../repositories/trainer.repository';
import { CepService } from '../../cep/services/cep.service';
import { TrainerNotFoundException } from '../../common/exceptions/trainer-not-found.exception';
import { TrainerResponseDto } from '../dto/trainer-response.dto';

@Injectable()
export class TrainerApplicationService {
  constructor(
    private readonly trainerDomainService: TrainerDomainService,
    private readonly trainerRepository: TrainerRepository,
    private readonly cepService: CepService,
  ) {}

  async create(data: {
    name: string;
    email: string;
    cep: string;
  }): Promise<TrainerResponseDto> {
    const address = await this.cepService.searchByCep(data.cep);

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
    return saved;
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
      const address = await this.cepService.searchByCep(data.cep);
      Object.assign(trainer, address);
    }

    Object.assign(trainer, data);
    const saved = await this.trainerRepository.save(trainer);
    return saved;
  }

  async findById(id: string): Promise<TrainerResponseDto> {
    const trainer = await this.trainerRepository.findById(id);

    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }

    return trainer;
  }

  async findAll(): Promise<TrainerResponseDto[]> {
    return this.trainerRepository.findAll();
  }

  async remove(id: string): Promise<void> {
    await this.trainerDomainService.validateTrainerCanBeRemoved(id);
    await this.trainerRepository.softDelete(id);
  }
}
