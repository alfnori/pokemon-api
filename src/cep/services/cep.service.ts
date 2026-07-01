import { Injectable } from '@nestjs/common';
import { CepGateway } from '../gateways/cep.gateway';
import { CepData } from '../interfaces/cep-response.interface';

@Injectable()
export class CepService {
  constructor(private readonly cepGateway: CepGateway) {}

  async searchByCep(cep: string): Promise<CepData> {
    return await this.cepGateway.searchByCep(cep);
  }
}
