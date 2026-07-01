# Fase 3 — Configuração

## Propósito

Centralizar a configuração da aplicação usando `@nestjs/config` com validation schema, garantindo que nenhuma classe leia `process.env` diretamente.

## Avaliação

Toda configuração é carregada via `ConfigService` com tipagem adequada e variáveis validadas na inicialização.

## Critérios

- `config/configuration.ts` exporta uma factory que retorna objeto tipado com todas as variáveis
- `config/database.config.ts` isola configurações de banco (host, port, user, password, database)
- `config/env.validation.ts` usa `Joi` ou `class-validator` para validar variáveis obrigatórias
- `AppModule` importa `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })`
- Nenhuma classe no projeto acessa `process.env` diretamente
- Variáveis definidas: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `POKE_API_BASE_URL`, `CEP_API_BASE_URL`, `POKEMON_CACHE_TTL`
