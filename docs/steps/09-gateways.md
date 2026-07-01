# Fase 9 — Gateways

## Propósito

Encapsular todas as chamadas HTTP para APIs externas (PokéAPI e ViaCEP) em classes Gateway, isolando o resto do sistema da infraestrutura de integração.

## Avaliação

Nenhum service ou controller faz chamadas HTTP diretas. Toda comunicação externa passa exclusivamente pelos Gateways.

## Critérios

- `PokemonGateway` com método `fetchPokemon(pokeApiId: number)` que consulta a PokéAPI e retorna dados normalizados
- `CepGateway` com método `searchByCep(cep: string)` que consulta o ViaCEP e retorna endereço normalizado
- Gateways usam `HttpService` do `@nestjs/axios` (não `axios` diretamente)
- Tratamento de erros de rede/timeout com fallback e exceções apropriadas
- Retorno tipado (interfaces/DTOs próprios, não dependentes do formato externo)
- Configuração das URLs base via `ConfigService` (injetado no construtor)
- Gateways são injetados nos Services de aplicação correspondentes
