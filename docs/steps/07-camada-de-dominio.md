# Fase 7 — Camada de Domínio

## Propósito

Implementar os Domain Services com as regras de negócio puras, sem dependência de HTTP, controllers ou infraestrutura.

## Avaliação

Toda regra de negócio está encapsulada em Domain Services que não conhecem o mundo externo. Eles operam apenas sobre entidades e repositórios.

## Critérios

- `TrainerDomainService` com regras: valida se treinador pode ser removido (não possui times ativos)
- `TeamDomainService` com regras: `validateTeamLimit()` (máx. 5 pokémons), `validateDuplicatePokemon()`, `validateTeamOwnership()`
- `PokemonDomainService` com regras: `validatePokemonExists()`, estratégia de cache/TTL
- Domain Services não importam controllers, HttpService, ou gateways
- Domain Services recebem repositórios por injeção de dependência
- Exceções de domínio são classes customizadas (ex.: `TeamFullException`, `PokemonDuplicatedException`)
