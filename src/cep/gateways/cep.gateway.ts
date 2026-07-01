import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CepData } from '../interfaces/cep-response.interface';

@Injectable()
export class CepGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async searchByCep(cep: string): Promise<CepData> {
    const baseUrl = this.configService.get<string>('cepApi.baseUrl');
    const sanitizedCep = cep.replace(/\D/g, '');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ViaCepResponse>(
          `${baseUrl}/${sanitizedCep}/json`,
          { timeout: 5000 },
        ),
      );

      if (data.erro) {
        throw new NotFoundException(`CEP ${cep} not found`);
      }

      return {
        cep: data.cep,
        street: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof AxiosError) {
        throw new ServiceUnavailableException(
          'ViaCEP is currently unavailable',
        );
      }
      throw error;
    }
  }
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
