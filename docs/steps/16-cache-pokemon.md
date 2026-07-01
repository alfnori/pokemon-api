# Fase 16 — Cache Pokémon

## Propósito

Implementar a estratégia de cache/TTL para dados de Pokémon, minimizando chamadas à PokéAPI e priorizando o banco local.

## Avaliação

Pokémon já persistidos são reutilizados do banco local dentro da janela de TTL, e o endpoint `POST /pokemons/:id/refresh` permite forçar atualização manual.

## Critérios

- Ao buscar Pokémon, verifica: existe no banco? → `lastSyncedAt` dentro do TTL? → retorna do banco
- Se não existe ou TTL expirou → busca na PokéAPI via Gateway → atualiza `lastSyncedAt` → persiste
- TTL configurável via `POKEMON_CACHE_TTL` (padrão: 7 dias = 604800 segundos)
- Endpoint `POST /pokemons/:id/refresh` que força atualização independente do TTL
- Pokémon recém-sincronizado tem `lastSyncedAt` atualizado para `new Date()`
- Lógica de cache centralizada no `PokemonApplicationService` ou `PokemonDomainService`
- Nenhuma chamada desnecessária à PokéAPI em cenários de cache hit
