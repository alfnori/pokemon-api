# Fase 19 — Fluxo de Dependências

## Propósito

Revisar a arquitetura final e garantir que o fluxo de dependências respeita o padrão Controller → Application Service → Domain Service ↔ Repository, com Gateways isolados na periferia.

## Avaliação

O grafo completo de dependências da aplicação é verificado e documentado, sem violações de camada.

## Critérios

```
                    HTTP
                      │
              Validation Pipe
                      │
                Controller
                      │
         Application Service (Use Cases)
                      │
         ┌────────────┴────────────┐
         │                         │
  Domain Services            External Gateways
  (Regras de negócio)      (PokéAPI / ViaCEP)
         │                         │
         └────────────┬────────────┘
                      │
                Repositories
                      │
                  TypeORM
                      │
                  PostgreSQL
```

- Controller não conhece repositórios, gateways ou domain services
- Application Service conhece todas as camadas abaixo
- Domain Service conhece apenas repositórios
- Gateways são injetados apenas em Application Services
- Repositórios são injetados em Domain Services e Application Services
- Nenhuma entidade é exposta em controllers (sempre mapeada por DTOs)
- Nenhum `process.env` é lido em qualquer classe
- Toda configuração externa (URLs, TTL) vem do `ConfigService`
