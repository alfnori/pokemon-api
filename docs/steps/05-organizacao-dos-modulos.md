# Fase 5 — Organização dos Módulos

## Propósito

Criar os módulos NestJS (`TrainerModule`, `TeamModule`, `PokemonModule`, `CepModule`) com escopo bem definido e importações corretas.

## Avaliação

Cada módulo declara seus controllers, providers e exports de forma que o grafo de dependências entre módulos é acíclico e coeso.

## Critérios

- `TrainerModule` declara `TrainerController`, `TrainerApplicationService`, `TrainerDomainService`, `TrainerRepository`
- `TeamModule` declara `TeamController`, `TeamApplicationService`, `TeamDomainService`, `TeamRepository`
- `PokemonModule` declara `PokemonController`, `PokemonApplicationService`, `PokemonDomainService`, `PokemonRepository`, `PokemonGateway`
- `CepModule` declara `CepService`, `CepGateway`
- Módulos importam `TypeOrmModule.forFeature([Entity])` para suas respectivas entidades
- `AppModule` importa todos os módulos de domínio
- Módulo de domínio não importa outro módulo de domínio inteiro — apenas serviços via exports quando necessário
