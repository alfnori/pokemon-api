import { Controller } from '@nestjs/common';
import { TeamApplicationService } from '../services/team-application.service';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamApplicationService: TeamApplicationService,
  ) {}
}
