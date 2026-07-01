# Fase 10 — Application Services

## Propósito

Implementar os Application Services que orquestram os casos de uso, coordenando Domain Services, Repositórios e Gateways.

## Avaliação

Cada operação de negócio (criar treinador, adicionar pokémon ao time, etc.) é um método no Application Service que segue o fluxo completo: validação → regras → persistência → resposta.

## Critérios

- `TrainerApplicationService` com métodos: `create()`, `update()`, `findById()`, `findAll()`, `remove()`
  - `create()` integra `CepGateway` para enriquecer endereço
  - `remove()` valida no Domain Service se treinador pode ser removido
- `TeamApplicationService` com métodos: `create()`, `findById()`, `findAll()`, `remove()`
  - `create()` recebe `trainerId` e valida existência do treinador
- `PokemonApplicationService` com métodos: `addToTeam()`, `removeFromTeam()`, `getById()`, `refresh()`
  - `addToTeam()` orquestra: busca/cria pokémon → valida limite → valida duplicidade → persiste associação
- Application Services usam `@Injectable()` e são injetados nos Controllers
- Retornam DTOs de resposta, não entidades
- Lançam exceções customizadas para erros de negócio
