import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './controllers/team.controller';
import { TeamApplicationService } from './services/team-application.service';
import { TeamDomainService } from './services/team-domain.service';
import { TeamRepository } from './repositories/team.repository';
import { TeamPokemonRepository } from './repositories/team-pokemon.repository';
import { Team } from './entities/team.entity';
import { TeamPokemon } from './entities/team-pokemon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamPokemon])],
  controllers: [TeamController],
  providers: [
    TeamApplicationService,
    TeamDomainService,
    TeamRepository,
    TeamPokemonRepository,
  ],
  exports: [
    TeamApplicationService,
    TeamDomainService,
    TeamRepository,
    TeamPokemonRepository,
  ],
})
export class TeamModule {}
