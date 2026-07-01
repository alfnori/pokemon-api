import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}
}
