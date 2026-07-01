import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PokemonData } from '../interfaces/pokemon-api-response.interface';

@Injectable()
export class PokemonGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchPokemon(pokeApiId: number): Promise<PokemonData> {
    const baseUrl = this.configService.get<string>('pokeApi.baseUrl');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PokeApiPokemonResponse>(
          `${baseUrl}/pokemon/${pokeApiId}`,
          { timeout: 5000 },
        ),
      );

      return {
        pokeApiId: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        height: data.height,
        weight: data.weight,
        types: data.types.map((t) => t.type.name),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException(
            `Pokémon with id ${pokeApiId} not found in PokéAPI`,
          );
        }
        throw new ServiceUnavailableException(
          'PokéAPI is currently unavailable',
        );
      }
      throw error;
    }
  }
}

export interface PokeApiPokemonResponse {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  height: number;
  weight: number;
  types: Array<{ type: { name: string } }>;
}
