import { Injectable } from '@nestjs/common';
import { TeamDomainService } from './team-domain.service';
import { TeamRepository } from '../repositories/team.repository';

@Injectable()
export class TeamApplicationService {
  constructor(
    private readonly teamDomainService: TeamDomainService,
    private readonly teamRepository: TeamRepository,
  ) {}
}
