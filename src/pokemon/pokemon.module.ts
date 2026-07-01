import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PokemonController } from './controllers/pokemon.controller';
import { PokemonApplicationService } from './services/pokemon-application.service';
import { PokemonDomainService } from './services/pokemon-domain.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { PokemonGateway } from './services/pokemon.gateway';
import { Pokemon } from './entities/pokemon.entity';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pokemon]),
    HttpModule,
    forwardRef(() => TeamModule),
  ],
  controllers: [PokemonController],
  providers: [
    PokemonApplicationService,
    PokemonDomainService,
    PokemonRepository,
    PokemonGateway,
  ],
  exports: [PokemonApplicationService, PokemonRepository],
})
export class PokemonModule {}
