# Fase 8 — Repository

## Propósito

Implementar repositórios com responsabilidade exclusiva de persistência, sem regras de negócio.

## Avaliação

Cada repositório encapsula consultas TypeORM específicas do domínio e é injetado apenas nos Domain Services ou Application Services.

## Critérios

- `TrainerRepository` com métodos: `save()`, `findById()`, `findAll()`, `softDelete()`, `existsWithActiveTeams()`
- `TeamRepository` com métodos: `save()`, `findById()`, `findByTrainer()`, `softDelete()`, `countPokemon()`, `existsPokemon()`
- `PokemonRepository` com métodos: `save()`, `findById()`, `findByPokeApiId()`, `findStale()`, `updateSync()`
- `TeamPokemonRepository` (ou similar) com métodos: `save()`, `findByTeamAndPokemon()`, `remove()`
- Repositórios estendem `Repository<Entity>` do TypeORM
- Nenhum repositório contém regras de negócio ou chamadas a serviços externos
- Métodos retornam entidades, não DTOs
