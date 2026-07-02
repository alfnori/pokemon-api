# Pokémon API — AGENTS.md

## Commands
- `yarn build` — compile (deleteOutDir: true, clears dist/)
- `yarn lint` — eslint + prettier (pre-existing lint issues in `http-exception.filter.ts` and `main.ts`: not your problem)
- `yarn test` — unit tests (jest, `src/**/*.spec.ts`)
- `yarn test:e2e` — e2e tests (`test/*.e2e-spec.ts`)
- `yarn migration:generate src/database/migrations/<name>` — generate a migration (requires `yarn build` first)
- `yarn migration:run` / `yarn migration:revert` — run/revert via `dist/database/typeorm.config.js`

## Architecture
- **NestJS** with TypeORM, PostgreSQL, Swagger, class-validator/class-transformer
- Global prefix: `api/v1`. Route `@Get(':id')` → `GET /api/v1/teams/:id`
- Each module: controller → `*ApplicationService` (orchestration) → `*DomainService` (validation) → repository (extends TypeORM `Repository<Entity>`)
- Mappers are static utility classes (no DI), e.g. `TeamMapper.entityToResponse(team)`
- Custom exceptions per domain extend NestJS HTTP exceptions (e.g. `TeamNotFoundException extends NotFoundException`)
- Global `HttpExceptionFilter` and `ValidationPipe` (whitelist + transform + forbidNonWhitelisted)

## Conventions
- **Entities**: `teamPokemons` (camelCase) via `@OneToMany`, but `team_pokemons` in DB via `@Entity('team_pokemons')`
- **Relation loading**: use TypeORM `relations` option object style, e.g. `{ teamPokemons: { pokemon: true } }` — **one query with LEFT JOIN, no N+1**
- **Repository `findById`** is bare (no relations). Controller `GET /teams/:id` calls `repository.findByIdWithTeam` (loads `{ teamPokemons: { pokemon: true } }`) — **one query with LEFT JOIN, no N+1**
- **Controllers** use `@Get(':id')` → method named `findByIdWithTeam`, calling `applicationService.findByIdWithTeam(id)`
- **Module exports**: always export repositories and services so other modules can use them
- **Testing**: e2e tests override `DatabaseModule` with `MockDatabaseModule` (sql.js, in-memory, synchronize: true)
- **Docker compose** has postgres, pgadmin, and the API. Env defaults in `.env`
- **Swagger docs** at `/api/docs`, decorated inline with `@ApiProperty`
- **Config** loaded via `ConfigModule` with Joi schema validation

## Key packages
- TypeORM v1 (experimental), NestJS v11, pg, sql.js (test), axios, @nestjs/axios, @nestjs/swagger
