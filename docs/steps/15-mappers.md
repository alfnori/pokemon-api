# Fase 15 — Mappers

## Propósito

Implementar mappers que convertem entidades em DTOs de resposta e vice-versa, mantendo a separação entre a camada de persistência e a camada HTTP.

## Avaliação

Nenhum DTO é construído manualmente nos controllers ou services — toda conversão passa pelo mapper correspondente.

## Critérios

- `TrainerMapper.entityToResponse(entity)` → `TrainerResponseDto`
- `TeamMapper.entityToResponse(entity, includePokemons?)` → `TeamResponseDto`
- `PokemonMapper.entityToResponse(entity)` → `PokemonResponseDto`
- Mappers são classes estáticas ou injetáveis com métodos puros (sem side effects)
- Mappers tratam coleções: `entitiesToResponse(entities)` → `ResponseDto[]`
- Não há lógica de negócio nos mappers — apenas transformação de dados
- Relacionamentos são mapeados de forma rasa ou profunda conforme o caso de uso (evitar loops)
