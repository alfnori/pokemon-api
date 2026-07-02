import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CepGateway } from './gateways/cep.gateway';

@Module({
  imports: [HttpModule],
  providers: [CepGateway],
  exports: [CepGateway],
})
export class CepModule {}
