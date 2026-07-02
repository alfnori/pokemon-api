# Pokémon API

REST API for Pokémon trainer management built with NestJS, TypeORM, and PostgreSQL. Integrates with PokéAPI for Pokémon data and ViaCEP for address lookup.

## Technologies

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| ORM | TypeORM (via `@nestjs/typeorm`) |
| Database | PostgreSQL 16 |
| Validation | class-validator + class-transformer |
| Documentation | Swagger / OpenAPI |
| HTTP client | Axios / `@nestjs/axios` |
| External APIs | PokéAPI, ViaCEP |
| Runtime | Node.js 22 |

---

## Quick Start

### Prerequisites

- Node.js >= 22
- Yarn
- Docker & Docker Compose

### 1. Clone and install

```bash
git clone <repository-url>
cd pokemon-api
yarn install
```

### 2. Start the database

```bash
docker compose up -d postgres
```

This starts PostgreSQL on port 5432. The default credentials are:

| Variable | Default |
|----------|---------|
| User | `pokemon` |
| Password | `pokemon` |
| Database | `pokemon_api` |

### 3. Run migrations

```bash
yarn build
yarn migration:run
```

> `yarn build` is required before migration commands because they run from the compiled output in `dist/`.

### 4. Start the application

```bash
yarn start:dev
```

The API will be available at `http://localhost:3000`.

---

## Docker Compose

```bash
# Start all services (API + PostgreSQL + pgAdmin)
docker compose up -d

# Start only the database (API runs locally)
docker compose up -d postgres

# View logs
docker compose logs -f api
```

The compose file defines three services:

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database |
| `pgadmin` | 5050 | Database admin UI (login: `admin@pokemon.com` / `admin`) |
| `api` | 3000 | NestJS application |

> The API service builds from the local `Dockerfile`. You may want to adjust `POKE_API_BASE_URL` and `POKEMON_CACHE_TTL` in the compose file's environment block.

---

## Environment Variables

All variables have sensible defaults (see `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Application port |
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `DATABASE_USER` | `pokemon` | Database user |
| `DATABASE_PASSWORD` | `pokemon` | Database password |
| `DATABASE_NAME` | `pokemon_api` | Database name |
| `POKE_API_BASE_URL` | `https://pokeapi.co/api/v2` | PokéAPI base URL |
| `CEP_API_BASE_URL` | `https://viacep.com.br/ws` | ViaCEP base URL |
| `POKEMON_CACHE_TTL` | `604800` | Pokemon cache TTL in seconds (7 days) |
| `TEAM_MAX_SIZE` | `5` | Max Pokémon per team |

---

## API Documentation

Swagger UI is available at:

**http://localhost:3000/api/docs**

---

## Architecture

```
Controller
     │
     ▼
Application Service  (use cases, orchestration)
     │
     ├── Domain Service   (business rules, validation)
     │
     └── External Gateway (PokéAPI / ViaCEP)
     │
     ▼
Repository  (persistence)
     │
     ▼
TypeORM → PostgreSQL
```

### Layer responsibilities

**Controller** — HTTP concerns only. Accepts DTOs, delegates to Application Service, returns response DTOs. Never accesses repositories or entities directly.

**Application Service** — Orchestrates use cases. Coordinates domain services, gateways, and repositories. Manages transactions. This is the entry point for business operations.

**Domain Service** — Pure business logic with no HTTP or persistence awareness. Validates rules like team size limits, duplicate Pokémon prevention, and trainer deletion constraints.

**Gateway** — Encapsulates external API calls (PokéAPI, ViaCEP). The rest of the system is unaware of external dependencies. Errors are translated to typed NestJS exceptions.

**Repository** — Data access layer. Extends TypeORM's `Repository<Entity>` for type-safe queries. Contains no business logic.

**Mapper** — Static utility classes that convert entities to DTOs. Keeps HTTP responses decoupled from database models.

### Why this architecture

The layered approach (Controller → Application Service → Domain Service → Repository) was chosen for three reasons:

1. **Testability** — Each layer can be unit-tested in isolation by mocking its dependencies.
2. **Separation of concerns** — Business rules live in Domain Services, HTTP concerns stay in Controllers, external integrations are hidden behind Gateways. Changing an external API or the database does not cascade through the codebase.
3. **Transaction control** — Application Services manage transactions via `DataSource.transaction()` when multiple entities must be written atomically (e.g., saving a new Pokémon and associating it with a team).

External integrations are gated behind dedicated Gateway classes rather than being called directly in services. This keeps business logic clean of HTTP concerns and makes it trivial to swap implementations (e.g., replace ViaCEP with a different CEP provider) by changing only the gateway.

---

## Data Model

```
Trainer (soft delete)
  1
  │
  N
 Team (cascade delete team_pokemons)
  1
  │
  N
 TeamPokemon (unique: team_id + pokemon_id)
  N
  │
  1
 Pokemon (independent, persists across teams)
```

### Trainer
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `name` | varchar(100) | |
| `email` | varchar(180) | Unique |
| `cep` | varchar(9) | |
| `street` | varchar(255) | Filled from ViaCEP |
| `district` | varchar(100) | Filled from ViaCEP |
| `city` | varchar(100) | Filled from ViaCEP |
| `state` | varchar(50) | Filled from ViaCEP |
| `deletedAt` | timestamp | Soft delete |

### Team
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `name` | varchar(100) | |
| `trainerId` | UUID | FK → Trainer |
| `deletedAt` | timestamp | Soft delete |

### TeamPokemon (join entity)
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `teamId` | UUID | FK → Team (cascade on delete) |
| `pokemonId` | UUID | FK → Pokemon |
| `position` | int | 1-based order |

Unique index on `(teamId, pokemonId)` prevents duplicate Pokémon in the same team at the database level.

### Pokemon (cache entity)
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `pokeApiId` | int | PokéAPI ID, unique |
| `name` | varchar(100) | |
| `sprite` | varchar(500) | Pokémon sprite URL |
| `height` / `weight` | int | In decimeters / hectograms |
| `types` | JSON | e.g. `["electric"]` |
| `lastSyncedAt` | timestamp | Cache staleness marker |

---

## Integration Strategies

### PokéAPI — Cache Strategy (TTL = 7 days)

```
Add Pokémon request
     │
     ▼
Does Pokémon exist locally?
     │            │
    YES           NO
     │            │
     ▼            ▼
  TTL expired?  Fetch from PokéAPI
     │     │        │
    YES    NO       ▼
     │     │    Save to DB
     │     │    Associate with team
     ▼     ▼
 Fetch → Update DB  Use local data
```

- **First request** — Always fetches from PokéAPI, persists to DB, then associates.
- **Subsequent requests** — Uses the local DB copy if `lastSyncedAt` is within the 7-day TTL.
- **Expired** — Re-fetches from PokéAPI, updates the local record, resets `lastSyncedAt`.
- **Manual refresh** — `POST /api/v1/pokemons/:id/refresh` forces a re-fetch regardless of TTL.

This strategy reduces external API calls, improves response time, and provides resilience against PokéAPI unavailability. The TTL is configurable via the `POKEMON_CACHE_TTL` environment variable.

### ViaCEP — Enrich-on-create

When a trainer is created via `POST /api/v1/trainers`, the provided CEP is used to fetch the full address (street, district, city, state) from ViaCEP. The address is persisted directly in the `trainers` table.

- Address fields are populated at creation time and on CEP change during `PATCH /api/v1/trainers/:id`.
- Subsequent reads do not call ViaCEP (the data lives in the database).
- This eliminates external dependency from read paths and keeps data stable even if ViaCEP is temporarily unavailable.

---

## Business Rules

### Team size limit
A team can hold at most 5 Pokémon. Attempting to add a 6th returns `400 Bad Request` with `TeamFullException`.
- Enforced in `TeamDomainService.validateTeamLimit()`.
- Checked via `COUNT` query inside a transaction to prevent race conditions.

### Duplicate Pokémon prevention
The same Pokémon cannot be added twice to the same team. Attempting returns `409 Conflict` with `PokemonDuplicatedException`.
- Application-level check before insert.
- Database-level unique constraint on `(team_id, pokemon_id)` as a safety net.

### Trainer deletion
- Uses **soft delete** (`deletedAt` column).
- Blocks deletion (returns `409 Conflict`) if the trainer has active teams.
- This avoids data loss and is more explicit than cascading deletes.

### Team deletion
- Uses **soft delete**.
- Associated `TeamPokemon` records are cascade-deleted.
- The Pokémon entities themselves are **not** deleted — they remain available for other teams.

---

## Endpoints

### Trainers
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/trainers` | Create trainer (auto-fills address from CEP) |
| `GET` | `/api/v1/trainers` | List all trainers |
| `GET` | `/api/v1/trainers/:id` | Get trainer by ID |
| `PATCH` | `/api/v1/trainers/:id` | Update trainer (re-fetches address if CEP changes) |
| `DELETE` | `/api/v1/trainers/:id` | Soft delete (blocks if trainer has active teams) |

### Teams
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/teams` | Create team |
| `GET` | `/api/v1/teams` | List all teams |
| `GET` | `/api/v1/teams/:id` | Get team with its Pokémon (sorted by position) |
| `DELETE` | `/api/v1/teams/:id` | Soft delete team |

### Team Pokémon
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/teams/:id/pokemons` | Add Pokémon to team (auto-fetches from PokéAPI if new) |
| `DELETE` | `/api/v1/teams/:id/pokemons/:pokemonId` | Remove Pokémon from team |

### Pokémon
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/pokemons/:id` | Get Pokémon by PokéAPI ID (uses cache if valid) |
| `POST` | `/api/v1/pokemons/:id/refresh` | Force refresh from PokéAPI |

---

## Commands

| Command | Description |
|---------|-------------|
| `yarn build` | Compile TypeScript to `dist/` |
| `yarn start:dev` | Start in watch mode |
| `yarn lint` | ESLint + Prettier check (with `--fix`) |
| `yarn test` | Unit tests (Jest) |
| `yarn test:e2e` | E2E tests (uses in-memory sql.js, no PostgreSQL needed) |
| `yarn migration:generate src/database/migrations/<name>` | Generate a new migration |
| `yarn migration:run` | Apply pending migrations |
| `yarn migration:revert` | Revert last migration |

---

## Testing

Unit tests use Jest and are co-located with source files (`*.spec.ts`).

E2e tests (`test/*.e2e-spec.ts`) override the production `DatabaseModule` with `MockDatabaseModule`, which uses an in-memory sql.js database with `synchronize: true`. This means:
- No PostgreSQL needed to run e2e tests.
- Schema is auto-created from entities.
- Tests are fully isolated and fast.

```bash
# Run unit tests
yarn test

# Run e2e tests
yarn test:e2e
```

---

## Authentication & Authorization

This API does not implement authentication or authorization — it was left out of scope to keep the focus on domain modeling, data flow, and integrations. In a production version, two layers would be required:

1. **User-scoped access (JWT)** — Each trainer authenticates via a token (e.g., JWT) scoped to their identity. Mutating endpoints (`POST/PATCH/DELETE` for trainers and teams) would verify that the authenticated user owns the resource before allowing changes. This prevents trainer A from modifying trainer B's teams.

2. **Admin/OAuth access** — A separate OAuth 2.0 flow (e.g., client credentials grant) would allow internal applications (dashboards, back-office tools) to read data across all trainers. This broader scope enables functionality like global Pokémon roster management without granting full user impersonation.

This separation follows the principle of least privilege: regular trainers mutate only their own data, while administrative access is reserved for authorized services.

---

## Future Improvements

- **Redis** — Distributed cache for Pokémon data, reducing DB reads and enabling cache sharing across instances.
- **BullMQ** — Asynchronous Pokémon sync queue, decoupling PokéAPI calls from API response time.
- **Domain Events** — Publish events for team creation, Pokémon addition, etc., enabling side effects without coupling.
- **CQRS** — Separate read and write models for complex queries (e.g., team composition reports).
- **Observability** — OpenTelemetry instrumentation for tracing, metrics, and structured logging.
- **Rate Limiting** — Protect external API integrations and prevent abuse.
- **Circuit Breaker** — Graceful degradation when PokéAPI or ViaCEP are unavailable.
- **Health Checks** — Readiness/liveness endpoints for container orchestration.
