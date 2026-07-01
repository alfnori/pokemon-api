# Fase 11 — Fluxo Completo: Adicionar Pokémon ao Time

## Propósito

Implementar o fluxo completo de adicionar um Pokémon a um time, percorrendo todas as camadas do sistema — este é o caso de uso central da aplicação.

## Avaliação

O endpoint `POST /teams/:id/pokemons` funciona de ponta a ponta, aplicando todas as regras de negócio e integrações externas.

## Critérios (Critérios)

```
POST /teams/:id/pokemons { "pokemonId": 25 }
```

- Controller recebe requisição, aplica `ValidationPipe` no DTO de entrada
- Application Service orquestra o fluxo
- TeamRepository busca o time (ou lança `TeamNotFoundException`)
- Se Pokémon não existe no banco local → `PokemonGateway` busca na PokéAPI → persiste
- Se Pokémon existe → verifica TTL (`lastSyncedAt`), se expirado → atualiza via Gateway
- `TeamDomainService.validateTeamLimit()` → rejeita com `TeamFullException` se time já tem 5
- `TeamDomainService.validateDuplicatePokemon()` → rejeita com `PokemonDuplicatedException` se já existe
- `TeamPokemonRepository.save()` persiste a associação
- Resposta é um DTO com dados do pokémon + posição no time
- Toda operação que altera múltiplas entidades é executada dentro de transação
