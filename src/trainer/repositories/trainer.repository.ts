import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';
import { Team } from '../../team/entities/team.entity';

@Injectable()
export class TrainerRepository extends Repository<Trainer> {
  constructor(
    @InjectRepository(Trainer)
    repo: Repository<Trainer>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findById(id: string): Promise<Trainer | null> {
    return this.findOneBy({ id });
  }

  async findWithTeams(id: string): Promise<Trainer | null> {
    return this.findOne({
      where: { id },
      relations: { teams: true },
      withDeleted: false,
    });
  }

  async findAll(): Promise<Trainer[]> {
    return this.find();
  }

  async existsWithActiveTeams(id: string): Promise<boolean> {
    const count = await this.manager.count(Team, {
      where: { trainerId: id },
    });
    return count > 0;
  }
}
