# Fase 6 — Configurando o TypeORM

## Propósito

Criar um `DatabaseModule` centralizado que configura o `TypeOrmModule.forRootAsync()` usando `ConfigService`.

## Avaliação

A conexão com o banco é estabelecida assincronamente usando as configurações centralizadas, permitindo que o DataSource seja gerenciado pelo TypeORM.

## Critérios

- `DatabaseModule` definido em `src/database/database.module.ts`
- Usa `TypeOrmModule.forRootAsync()` com `inject: [ConfigService]`
- `useFactory` retorna objeto de configuração a partir do `ConfigService`
- Entidades carregadas via `entities: [__dirname + '/../**/*.entity{.ts,.js}']` ou importação explícita
- `DatabaseModule` é importado globalmente ou apenas no `AppModule`
- Configuração respeita `synchronize: false` e `autoLoadEntities: true` (se usado)
- Compatível com a CLI de migrations (DataSource separado em `typeorm.config.ts`)
