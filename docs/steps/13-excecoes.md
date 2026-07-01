# Fase 13 — Exceções

## Propósito

Criar exceções customizadas e um filtro global que produza respostas de erro padronizadas, substituindo `throw new BadRequestException()` disperso pelo código.

## Avaliação

Toda exceção de negócio possui uma classe própria e o payload de erro HTTP é consistente (status code, mensagem, timestamp, caminho).

## Critérios

- Exceções em `common/exceptions/`:
  - `PokemonNotFoundException`
  - `TrainerNotFoundException`
  - `TeamNotFoundException`
  - `TeamFullException`
  - `PokemonDuplicatedException`
  - `TrainerHasActiveTeamsException`
- Exceções estendem `HttpException` ou `BadRequestException` / `ConflictException` / `NotFoundException` conforme semântica
- `HttpExceptionFilter` global implementa `ExceptionFilter` e captura todas as exceções
- Resposta de erro padronizada: `{ statusCode, message, error, timestamp, path }`
- Filtro registrado no `main.ts` via `app.useGlobalFilters()`
- Nenhum service/controller lança `new Error()` ou `throw 'string'`
