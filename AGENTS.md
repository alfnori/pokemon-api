# AGENTS.md — pokemon-api

## Project Purpose

NestJS REST API for a Leany Senior Backend Developer technical challenge. Manages Pokémon trainers, teams, and Pokémon with PokéAPI + ViaCEP integration.

## Architecture (see `docs/`)

Clean Architecture + DDD-light monolith:

```
Controller → Application Service → Domain Service → Repository → TypeORM → PostgreSQL
                                       ↓
                               External Gateway (PokéAPI / ViaCEP)
```

Modules: `trainer`, `team`, `pokemon`, `cep` — each with `controller/`, `service/`, `repository/`, `dto/`, `entity/`.

## Key Constraints

- **TypeORM only** — no other ORMs
- **Migrations only** — `synchronize: false`, never `synchronize: true`
- **PostgreSQL via Docker** — docker-compose with `api`, `postgres`, `pgadmin`
- **Soft delete** on Trainer/Team (use `@DeleteDateColumn`)
- **No `process.env` in classes** — use `@nestjs/config` `ConfigService`
- **No entities in HTTP responses** — use DTOs + mappers
- **No repositories in controllers** — inject only Application Services
- **No direct HTTP calls in services** — encapsulate in Gateway classes

## Commands

| Command | Purpose |
|---|---|
| `yarn` | Install dependencies |
| `yarn start:dev` | Watch mode dev server |
| `yarn build` | Compile to `dist/` |
| `yarn lint` | ESLint + fix |
| `yarn format` | Prettier `src/` and `test/` |
| `yarn test` | Unit tests (Jest, `*.spec.ts` in `src/`) |
| `yarn test:e2e` | E2E tests (`test/*.e2e-spec.ts`) |
| `yarn test:cov` | Test coverage |

## Tooling

- **NestJS 11** with `nodenext` module resolution
- **TypeScript 5.7**, target ES2023
- **Prettier**: single quotes, trailing commas
- **ESLint**: `typescript-eslint` recommended + prettier plugin, `no-explicit-any` off
- **Jest**: ts-jest transform, tests match `*.spec.ts`
- **E2E**: supertest, separate `jest-e2e.json` config, rootDir `.`, regex `.e2e-spec.ts$`

## Docs

- `docs/task.md` — full challenge requirements
- `docs/steps.md` — implementation order (18 phases)
- `docs/evaluation.md` — architecture decisions, data model, endpoints, business rules

## Gotchas

- `module: "nodenext"` means imports need explicit `.js` extensions when compiling — NestJS CLI handles this for `nest build` but be careful in test/standalone scripts
- TypeORM 1.x uses the new `DataSource` pattern, not `Connection`
- ValidationPipe is **not** global by default — configure in `main.ts`
- The project is currently at scaffolding stage (NestJS starter) — all domain code still needs implementation
