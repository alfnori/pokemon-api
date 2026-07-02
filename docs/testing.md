# API Testing Guide

## Objective

This document defines the expected test scenarios for the Pokémon API. The goal is to ensure business rules are enforced, persistence behaves correctly, external integrations work as expected, error handling is consistent, and data integrity is preserved.

---

## Test Strategy

The project is validated at four levels:

1. **Unit Tests** — Isolated service/domain logic, external dependencies mocked.
2. **Integration Tests** — Repository + database, TypeORM relations, transactions.
3. **API (E2E) Tests** — Full request/response cycle via HTTP, using in-memory sql.js (MockDatabaseModule).
4. **Manual Validation** — Ad-hoc verification via Swagger or curl.

---

## Coverage Matrix

| Area | Required |
|------|----------|
| Trainer CRUD | ✅ |
| Team CRUD | ✅ |
| Pokémon cache/refresh | ✅ |
| Team ↔ Pokémon association | ✅ |
| PokéAPI integration | ✅ |
| ViaCEP integration | ✅ |
| Business rules (limit, duplicate, deletion) | ✅ |
| Error handling | ✅ |
| Cascade / integrity | ✅ |

---

## E2E Test Setup

Tests use the existing NestJS testing harness with `MockDatabaseModule` (sql.js, in-memory, `synchronize: true`). No PostgreSQL required.

```typescript
// test/app.e2e-spec.ts (existing pattern)
const moduleFixture = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(DatabaseModule)
  .useModule(MockDatabaseModule)
  .compile();
app = moduleFixture.createNestApplication();
app.setGlobalPrefix('api/v1');
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
await app.init();
```

---

## Trainer

### Create Trainer — Success

Given a valid payload with `name`, `email`, and `cep`:

```
POST /api/v1/trainers
Body: { "name": "Ash", "email": "ash@pokemon.com", "cep": "01001000" }
```

Expect:
- `201 Created`
- Response body includes `id`, `name`, `email`, `cep`, `street`, `district`, `city`, `state`, `createdAt`, `updatedAt`
- Address fields populated from ViaCEP (street, district, city, state)

### Create Trainer — Invalid Email

```
POST /api/v1/trainers
Body: { "name": "Ash", "email": "not-an-email", "cep": "01001000" }
```

Expect: `400 Bad Request`

### Create Trainer — Missing Name

```
POST /api/v1/trainers
Body: { "email": "ash@pokemon.com", "cep": "01001000" }
```

Expect: `400 Bad Request`

### Create Trainer — Invalid CEP

```
POST /api/v1/trainers
Body: { "name": "Ash", "email": "ash@pokemon.com", "cep": "invalid" }
```

Expect: `400 Bad Request` (via ValidationPipe or CEP lookup failure)

### Patch Trainer — Update Name

```
PATCH /api/v1/trainers/:id
Body: { "name": "Ash Ketchum" }
```

Expect: `200 OK` with updated name

### Patch Trainer — Change CEP (re-fetches address)

```
PATCH /api/v1/trainers/:id
Body: { "cep": "22001000" }
```

Expect: `200 OK` with new address fields from ViaCEP

### Get Trainer By ID

```
GET /api/v1/trainers/:id
```

Expect: `200 OK` with full trainer data

### Get All Trainers

```
GET /api/v1/trainers
```

Expect: `200 OK` with array of trainers

### Delete Trainer — Without Teams

```
DELETE /api/v1/trainers/:id
```

Expect: `204 No Content`
- Trainer soft-deleted (`deletedAt` set)

### Delete Trainer — With Active Teams

Given the trainer has at least one team:

```
DELETE /api/v1/trainers/:id
```

Expect: `409 Conflict`
- Body contains message explaining deletion is blocked due to active teams
- Trainer remains undeleted

### Delete Trainer — Not Found

```
DELETE /api/v1/trainers/00000000-0000-0000-0000-000000000000
```

Expect: `404 Not Found`

---

## Team

### Create Team — Success

Given an existing trainer:

```
POST /api/v1/teams
Body: { "name": "Dream Team", "trainerId": "<valid-uuid>" }
```

Expect:
- `201 Created`
- Response includes `id`, `name`, `trainerId`, `createdAt`, `updatedAt`
- `pokemons` is an empty array

### Create Team — Trainer Not Found

```
POST /api/v1/teams
Body: { "name": "Ghost Team", "trainerId": "00000000-0000-0000-0000-000000000000" }
```

Expect: `404 Not Found`

### Get Team By ID

```
GET /api/v1/teams/:id
```

Expect: `200 OK`
- Response includes `pokemons` array sorted by position
- Each entry has `position` and `pokemon` object

### Get All Teams

```
GET /api/v1/teams
```

Expect: `200 OK` with array of teams

### Delete Team

Given an existing team with associated Pokémon:

```
DELETE /api/v1/teams/:id
```

Expect: `204 No Content`
- Team soft-deleted
- TeamPokemon associations cascade-deleted
- Pokémon entities remain in database (verify with Pokémon GET endpoint)

### Delete Team — Not Found

```
DELETE /api/v1/teams/00000000-0000-0000-0000-000000000000
```

Expect: `404 Not Found`

---

## Team ↔ Pokémon

### Add Pokémon — New to Database

Given a team and a `pokeApiId` not yet in the local database:

```
POST /api/v1/teams/:id/pokemons
Body: { "pokemonId": 25 }
```

Expect:
- `201 Created`
- Response includes `position` and full `pokemon` object
- Pokémon fetched from PokéAPI and persisted (verify with GET Pokémon endpoint)

### Add Pokémon — Already Cached

Given a Pokémon already in the local database (within TTL):

```
POST /api/v1/teams/:id/pokemons
Body: { "pokemonId": 25 }
```

Expect:
- `201 Created`
- No external PokéAPI call (verify via gateway mock or lastSyncedAt unchanged)
- Pokémon reused from local database

### Add Pokémon — Sixth Pokémon (exceeds limit)

Given a team already with 5 Pokémon:

```
POST /api/v1/teams/:id/pokemons
Body: { "pokemonId": 6 }
```

Expect: `400 Bad Request`
- Message indicates maximum team size exceeded

### Add Pokémon — Duplicate

Given the Pokémon is already in the team:

```
POST /api/v1/teams/:id/pokemons
Body: { "pokemonId": 25 }
```

Expect: `409 Conflict`
- No duplicate association created

### Add Pokémon — PokéAPI Not Found

```
POST /api/v1/teams/:id/pokemons
Body: { "pokemonId": 999999 }
```

Expect: `404 Not Found`
- No Pokémon persisted
- No association created

### Remove Pokémon from Team

Given an existing association:

```
DELETE /api/v1/teams/:id/pokemons/:pokemonUuid
```

Expect: `204 No Content`
- Association removed
- Pokémon entity remains in database

### Remove Pokémon — Not in Team

```
DELETE /api/v1/teams/:id/pokemons/00000000-0000-0000-0000-000000000000
```

Expect: `404 Not Found`

---

## Pokémon

### Get Pokémon by PokéAPI ID — Cached

Given the Pokémon exists in the local database and is within TTL:

```
GET /api/v1/pokemons/25
```

Expect:
- `200 OK`
- Full Pokémon data returned from local database
- No external PokéAPI call

### Refresh Pokémon — Force Sync

```
POST /api/v1/pokemons/25/refresh
```

Expect:
- `200 OK`
- External PokéAPI called
- `lastSyncedAt` updated
- Pokémon data refreshed

### Get Pokémon — Not Found in PokéAPI

```
GET /api/v1/pokemons/999999
```

Expect: `404 Not Found`

---

## Error Response Format

Every error response must follow a consistent structure:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

Verify for:
- `400` — validation errors, team full
- `404` — resource not found (trainer, team, pokémon)
- `409` — duplicate Pokémon, trainer deletion blocked
- `500` — unexpected server errors (never expose internals)

---

## Business Rule Validation Matrix

| Rule | Endpoint | Expected Status | Verification |
|------|----------|----------------|--------------|
| Team max 5 Pokémon | `POST /teams/:id/pokemons` | 400 | Count before and after |
| No duplicate Pokémon in team | `POST /teams/:id/pokemons` | 409 | Verify unique constraint |
| Trainer deletion blocked with teams | `DELETE /trainers/:id` | 409 | Verify trainer still exists |
| Team deletion cascades TeamPokemon | `DELETE /teams/:id` | 204 | Verify TeamPokemon removed, Pokémon kept |
| Trainer soft delete (no teams) | `DELETE /trainers/:id` | 204 | Verify `deletedAt` set |
| CEP enriches address on create | `POST /trainers` | 201 | Verify address fields populated |
| CEP re-fetches on change | `PATCH /trainers/:id` | 200 | Verify address fields updated |
| Invalid CEP rejected | `POST /trainers` | 400 | ViaCEP returns erro=true |

---

## Database Integrity

### Cascade Rules

| Action | TeamPokemon | Pokemon |
|--------|-------------|---------|
| Delete Team | Removed (CASCADE) | Preserved |
| Soft-delete Trainer | Preserved (trainer not deleted if teams exist) | Preserved |

### Unique Constraints

- `trainers.email` — unique
- `pokemons.poke_api_id` — unique
- `team_pokemons` (team_id + pokemon_id) — unique

---

## External Integration Tests

### PokéAPI

- **Success** — HTTP 200, data mapped correctly (name, sprite, types, height, weight)
- **Not Found (404)** — Returns 404, no DB insertion
- **Unavailable** — Simulate timeout/500, returns 503 Service Unavailable, no inconsistent data

### ViaCEP

- **Success** — Valid CEP returns full address, mapped and persisted
- **Not Found** — ViaCEP returns `{ "erro": true }`, returns 404
- **Unavailable** — Simulate timeout/500, returns 503 Service Unavailable

---

## DTO Validation

Every endpoint must validate:

| Scenario | Expected |
|----------|----------|
| Required field missing | 400 |
| Invalid type (string instead of number) | 400 |
| Empty string | 400 |
| Null value for required field | 400 |
| Malformed JSON body | 400 |
| Unknown field (forbidNonWhitelisted) | 400 |

---

## Security / Robustness

| Scenario | Expected |
|----------|----------|
| Unknown route | 404 |
| Malformed UUID | 400 |
| Unexpected exception | 500 (generic, no stack trace) |
| Sensitive data in error response | Never |

---

## Suggested E2E Test Structure

```
test/
  app.e2e-spec.ts               (existing — smoke test)
  trainer.e2e-spec.ts           (trainer CRUD + deletion rules)
  team.e2e-spec.ts              (team CRUD + get with pokemons)
  team-pokemon.e2e-spec.ts      (add/remove, limit, duplicate)
  pokemon.e2e-spec.ts           (get, refresh, cache behavior)
```

Each spec file follows the same setup pattern from `app.e2e-spec.ts` (override DatabaseModule with MockDatabaseModule, apply global pipes/prefix).

---

## Manual Validation Checklist

- [ ] Create trainer (address auto-filled from CEP)
- [ ] Update trainer (CEP change re-fetches address)
- [ ] Delete trainer blocked when teams exist
- [ ] Delete trainer without teams (soft delete)
- [ ] Create team linked to trainer
- [ ] Add Pokémon to team (new → PokéAPI fetch + persist)
- [ ] Add same Pokémon again (reuses cache)
- [ ] Add 6th Pokémon (rejected)
- [ ] Add duplicate Pokémon (rejected)
- [ ] Get team with Pokémon list sorted by position
- [ ] Remove Pokémon from team (association gone, Pokémon kept)
- [ ] Delete team (associations removed, Pokémon kept)
- [ ] Refresh Pokémon manually
- [ ] Invalid endpoints return proper HTTP errors

---

## Acceptance Criteria

The implementation is considered complete only if:

- All business rules pass automated verification.
- Team limit of 5 is enforced (application + database level).
- Duplicate Pokémon prevention works (application + unique index).
- Trainer deletion follows soft-delete with active-teams block.
- Pokémon data is persisted and reused according to TTL strategy.
- PokéAPI integration is isolated behind a gateway.
- ViaCEP integration enriches trainer address on create/update.
- Error responses are consistent across all endpoints.
- Database integrity is preserved after all operations.
