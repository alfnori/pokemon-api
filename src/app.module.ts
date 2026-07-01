import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/env.validation';
import { TrainerModule } from './trainer/trainer.module';
import { TeamModule } from './team/team.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { CepModule } from './cep/cep.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    TrainerModule,
    TeamModule,
    PokemonModule,
    CepModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
