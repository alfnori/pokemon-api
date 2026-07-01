import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';

@Injectable()
export class TrainerRepository {
  constructor(
    @InjectRepository(Trainer)
    private readonly repo: Repository<Trainer>,
  ) {}

  async findById(id: string): Promise<Trainer | null> {
    return this.repo.findOneBy({ id });
  }

  async findWithTeams(id: string): Promise<Trainer | null> {
    return this.repo.findOne({
      where: { id },
      relations: { teams: true },
      withDeleted: false,
    });
  }
}
