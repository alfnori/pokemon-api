import { Injectable } from '@nestjs/common';
import { CepGateway } from '../gateways/cep.gateway';

@Injectable()
export class CepService {
  constructor(private readonly cepGateway: CepGateway) {}
}
