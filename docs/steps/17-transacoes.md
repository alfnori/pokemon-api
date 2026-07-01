# Fase 17 — Transações

## Propósito

Garantir consistência dos dados usando transações do TypeORM sempre que múltiplas entidades são alteradas em uma única operação.

## Avaliação

Operações que criam/atualizam múltiplas entidades relacionadas são executadas dentro de transações, com rollback em caso de falha.

## Critérios

- `PokemonApplicationService.addToTeam()` executa em transação: criar Pokémon (se novo) + criar `TeamPokemon`
- Transações usam `QueryRunner` do TypeORM ou `@Transactional()` de biblioteca auxiliar
- Rollback automático se qualquer etapa do fluxo lançar exceção
- Repositórios aceitam `manager` opcional para participar de transações existentes
- Leituras simples sem gravação não utilizam transação
- Não há transações aninhadas — uma única transação por operação
- `CepGateway` (leitura externa) não participa da transação — executado antes
