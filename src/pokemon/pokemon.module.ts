import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PokemonController } from './controllers/pokemon.controller';
import { PokemonApplicationService } from './services/pokemon-application.service';
import { PokemonDomainService } from './services/pokemon-domain.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { PokemonGateway } from './services/pokemon.gateway';
import { Pokemon } from './entities/pokemon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon]), HttpModule],
  controllers: [PokemonController],
  providers: [
    PokemonApplicationService,
    PokemonDomainService,
    PokemonRepository,
    PokemonGateway,
  ],
  exports: [
    PokemonApplicationService,
    PokemonRepository,
    PokemonDomainService,
    PokemonGateway,
  ],
})
export class PokemonModule {}
