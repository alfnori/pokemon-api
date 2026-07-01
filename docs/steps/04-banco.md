# Fase 4 — Banco

## Propósito

Configurar o TypeORM DataSource para migrations e seeds, garantindo que `synchronize: false` seja a regra.

## Avaliação

O banco de dados PostgreSQL é criado via Docker, o TypeORM se conecta corretamente e o ciclo de migrations está funcional.

## Critérios

- Docker Compose com serviços `api`, `postgres` e `pgadmin`
- `database/typeorm.config.ts` exporta `DataSource` configurado para CLI de migrations
- `synchronize: false` em toda configuração do TypeORM
- Scripts no `package.json` para `migration:generate`, `migration:run`, `migration:revert`
- `database/migrations/` populada com migrations geradas a partir das entidades
- Conexão com PostgreSQL via variáveis de ambiente (não valores fixos)
- Container PostgreSQL com volume persistente
