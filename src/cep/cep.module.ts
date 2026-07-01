import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CepService } from './services/cep.service';
import { CepGateway } from './gateways/cep.gateway';

@Module({
  imports: [HttpModule],
  providers: [CepService, CepGateway],
  exports: [CepService],
})
export class CepModule {}
