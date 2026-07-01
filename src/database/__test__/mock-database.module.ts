import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from '../../trainer/entities/trainer.entity';
import { Team } from '../../team/entities/team.entity';
import { TeamPokemon } from '../../team/entities/team-pokemon.entity';
import { Pokemon } from '../../pokemon/entities/pokemon.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      entities: [Trainer, Team, TeamPokemon, Pokemon],
      synchronize: true,
    }),
  ],
})
export class MockDatabaseModule {}
