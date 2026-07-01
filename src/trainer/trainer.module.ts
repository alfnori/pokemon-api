import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerController } from './controllers/trainer.controller';
import { TrainerApplicationService } from './services/trainer-application.service';
import { TrainerDomainService } from './services/trainer-domain.service';
import { TrainerRepository } from './repositories/trainer.repository';
import { Trainer } from './entities/trainer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer])],
  controllers: [TrainerController],
  providers: [
    TrainerApplicationService,
    TrainerDomainService,
    TrainerRepository,
  ],
  exports: [TrainerApplicationService, TrainerRepository],
})
export class TrainerModule {}
