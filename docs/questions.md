# Perguntas e Respostas — Decisões Técnicas

---

## Arquitetura Geral, Banco de Dados e Camadas

### Qual banco de dados você utilizou e por quê? Como você configurou o Docker para ele?

**Resposta:**

Utilizei **PostgreSQL 16**. A escolha se deu por três motivos principais:

1. **Maturidade relacional** — O domínio possui relacionamentos claros (Treinador → Time → TeamPokemon → Pokemon) com restrições de integridade referencial e índices únicos compostos. Um banco relacional é a ferramenta natural para esse tipo de dado.
2. **Ecossistema TypeORM** — O TypeORM tem suporte de primeira classe para PostgreSQL, incluindo migrations, índices, unique constraints, cascade e soft delete via `@DeleteDateColumn`.
3. **Exigência do desafio** — O enunciado pedia PostgreSQL ou MySQL; PostgreSQL foi escolhido por ser mais alinhado com o ecossistema NestJS em produção.

O Docker foi configurado via `docker-compose.yml` com três serviços:

- **postgres** — imagem `postgres:16-alpine`, porta `5432`, health check com `pg_isready`. As credenciais são configuráveis via variáveis de ambiente com defaults no `.env`.
- **pgadmin** — imagem `dpage/pgadmin4`, porta `5050`, para administração visual do banco.
- **api** — constrói a aplicação via `Dockerfile` multistage, depende do postgres estar saudável.

O banco é iniciado com `docker compose up -d postgres`. O `synchronize: false` está configurado — todas as alterações de schema são feitas exclusivamente via **migrations** geradas pelo TypeORM.

---

### Como você estruturou as camadas da sua aplicação (Controller, Service, Repository)? Como garantiu a separação de responsabilidades e o fluxo de dados entre elas?

**Resposta:**

A arquitetura segue uma progressão em camadas com responsabilidades bem definidas:

```
Controller → ApplicationService → DomainService → Repository
                                → Gateway (integrações externas)
```

**Controller** — Responsável apenas por receber a requisição HTTP, delegar ao Application Service e retornar a resposta. Nunca acessa repositórios ou entidades diretamente. Um controller de time, por exemplo, chama `teamApplicationService.findByIdWithTeam(id)` e retorna o `TeamResponseDto`.

**Application Service** — Orquestra casos de uso. Ele coordena Domain Services (validação), Gateways (APIs externas) e Repositories (persistência). É aqui que transações são gerenciadas via `DataSource.transaction()` quando múltiplas entidades precisam ser salvas atomicamente. Exemplo: adicionar um Pokémon envolve (1) verificar se já existe no banco, (2) buscar da PokéAPI se necessário, (3) salvar o Pokémon, (4) validar limites do time, (5) criar a associação TeamPokemon — tudo dentro de uma transação.

**Domain Service** — Contém **apenas regras de negócio**, sem conhecimento de HTTP ou persistência. Por exemplo, `TeamDomainService.validateTeamLimit()` verifica se o time atingiu o máximo de 5 Pokémon. `TrainerDomainService.validateTrainerCanBeRemoved()` verifica se o treinador possui times ativos antes de permitir a exclusão.

**Repository** — Camada de persistência que estende `Repository<Entity>` do TypeORM. Contém apenas consultas nomeadas (`findById`, `findByTrainer`, `countPokemon`). Sem regras de negócio.

**Gateway** — Encapsula chamadas a APIs externas (PokéAPI, ViaCEP). O restante do sistema não sabe que existe uma chamada HTTP — ele apenas chama `pokemonGateway.fetchPokemon(id)` ou `cepGateway.searchByCep(cep)`.

**Mapper** — Classes estáticas que convertem entidades em DTOs de resposta. Exemplo: `TeamMapper.entityToResponse(team)`.

A separação é garantida por **injeção de dependências** do NestJS: Controllers só injetam Application Services, Application Services injetam Domain Services + Repositories + Gateways, Repositories são injetados pelo TypeORM. Nenhuma camada "pula" a hierarquia.

---

## Entidades, DTOs e Isolamento de Dados

### Como você implementou o mapeamento e o isolamento entre Entidades (do banco) e DTOs (de tráfego na API)? Onde essa lógica reside?

**Resposta:**

O isolamento é feito através de **Mapper classes estáticas** — uma por domínio, localizadas no diretório `mappers/` de cada módulo:

```
src/team/mappers/team.mapper.ts
src/pokemon/mappers/pokemon.mapper.ts
src/trainer/mappers/trainer.mapper.ts
```

Cada mapper expõe métodos estáticos como `entityToResponse(entity)` e `entitiesToResponse(entities[])` que convertem entidades TypeORM em DTOs de resposta (`*ResponseDto`). Não há uso de bibliotecas de auto-mapping (como `automapper`) por duas razões:

1. **Controle explícito** — Cada campo é mapeado manualmente, o que torna a transformação visível, testável e fácil de modificar quando a estrutura da entidade ou do DTO muda.
2. **Sem overhead de configuração** — Em um projeto com ~3 entidades principais, um mapper manual é mais simples e direto que configurar um auto-mapper.

Os mappers também são responsáveis por transformar relações carregadas. Por exemplo, `TeamMapper.entityToResponse` recebe um parâmetro `includePokemons` que, quando `true`, percorre `entity.teamPokemons`, ordena por `position`, e para cada `TeamPokemon` mapeia o `pokemon` relacioando via `PokemonMapper.entityToResponse`.

---

### Como você garantiu que as entidades do banco de dados não "vazassem" para fora da camada de repositório (ou seja, não são retornadas diretamente por serviços ou controllers)?

**Resposta:**

A garantia é arquitetural, não técnica:

1. **Controllers retornam DTOs, nunca entidades.** A assinatura dos métodos do controller é `Promise<TeamResponseDto>` — o tipo já força a conversão.
2. **Application Services chamam os Mappers antes de retornar.** Todo método de caso de uso faz `return TeamMapper.entityToResponse(team)` — a entidade é convertida antes de sair do serviço.
3. **Serialização do NestJS** — Mesmo que uma entidade fosse retornada inadvertidamente, o `class-transformer` com `@Exclude()` poderia ser usado como barreira adicional (embora não tenha sido necessário no escopo atual).
4. **Nenhum repositório é injetado em controllers.** A injeção de dependências do NestJS impede esse vazamento estruturalmente — o controller só conhece a interface do Application Service.

Não há uso de `@Exclude()` ou interceptors de transformação automática porque a barreira dos Mappers é suficiente e mais explícita.

---

## Validação de Dados e Gerenciamento de Permissões

### Como você implementou a validação de dados de entrada (DTOs) em suas rotas? Quais atributos e tipos você validou e quais ferramentas ou abordagens utilizou?

**Resposta:**

A validação é feita com **class-validator** + **class-transformer**, configurada globalmente no `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // remove campos não decorados
    transform: true,          // converte payload para instância da classe DTO
    forbidNonWhitelisted: true, // rejeita campos desconhecidos
  }),
);
```

Cada DTO de entrada utiliza decorators do class-validator. Exemplos:

```typescript
// CreateTrainerDto
@IsString()
@IsNotEmpty()
@Length(1, 100)
name: string;

@IsEmail()
@IsNotEmpty()
email: string;

@Matches(/^\d{5}-?\d{3}$/)
cep: string;
```

Atributos validados por domínio:

| Domínio | DTO | Validações |
|---------|-----|------------|
| Trainer | `CreateTrainerDto` | `@IsString`, `@IsNotEmpty`, `@Length`, `@IsEmail`, `@Matches` (CEP) |
| Trainer | `UpdateTrainerDto` | `@IsOptional`, `@IsString`, `@IsEmail`, `@Matches` |
| Team | `CreateTeamDto` | `@IsString`, `@IsNotEmpty`, `@IsUUID` (trainerId) |
| Team | `AddPokemonToTeamDto` | `@IsInt`, `@Min(1)` (pokemonId) |

A validação de CEP usa `@Matches(/^\d{5}-?\d{3}$/)` que aceita tanto `01001000` quanto `01001-000`.

---

### Como você implementou o gerenciamento e a validação de permissões (ex: em middlewares, decorators)? Explique a lógica de permissão que você aplicou.

**Resposta:**

**Não foi implementado um sistema de permissões** — a decisão foi consciente e documentada no README.

O motivo é que o escopo do desafio não incluía autenticação/autorização, e implementar um sistema mock (como um header fixo `X-Trainer-Id`) criaria uma camada de complexidade que não seria testada nem avaliada, além de poder sugerir que um sistema real de segurança poderia ser implementado dessa forma insegura.

A abordagem preferida em produção seria:

1. **JWT scoped ao treinador** — Cada request autenticado conteria um token com o `trainerId`. Um guard global verificaria se o recurso solicitado pertence ao treinador do token, bloqueando acesso cruzado (ex: treinador A não pode modificar times do treinador B).
2. **OAuth 2.0 para acesso administrativo** — Aplicações internas (dashboards, back-office) usariam client credentials grant para acessar dados de todos os treinadores sem necessidade de impersonificação.

Isso está descrito na seção **Authentication & Authorization** do README como uma melhoria futura planejada, não como uma omissão.

---

## Integrações Externas (CEP e PokeAPI)

### Qual foi sua abordagem para a integração com a API de consulta de CEP? Como ela foi disponibilizada como um serviço interno?

**Resposta:**

A integração com ViaCEP foi implementada em duas camadas dentro do módulo `cep/`:

**CepGateway** — Classe responsável exclusivamente pela chamada HTTP ao ViaCEP. Usa `HttpService` do `@nestjs/axios`. A URL base é configurável via `CEP_API_BASE_URL`. O gateway:
- Sanitiza o CEP (remove não-dígitos) antes de enviar
- Trata timeout de 5 segundos
- Detecta CEP inválido via `{ erro: true }` na resposta do ViaCEP e lança `NotFoundException`
- Detecta falha de conexão e lança `ServiceUnavailableException`

**CepService** — Serviço interno que encapsula o gateway. Disponível para injeção em outros módulos. Atualmente expõe `searchByCep(cep)` que delega ao gateway.

O fluxo de integração com o domínio acontece no `TrainerApplicationService`:

- **Create**: ao criar um treinador com CEP, o serviço chama `cepGateway.searchByCep(data.cep)`, recebe `{ street, district, city, state }`, e persiste esses campos junto com o treinador.
- **Update**: se o CEP for alterado no `PATCH /trainers/:id`, o endereço é re-buscado do ViaCEP e atualizado.

Essa estratégia de **enriquecer na escrita** elimina a dependência do ViaCEP nas leituras — consultas futuras ao treinador não fazem chamadas externas.

---

### Como você implementou o serviço de pesquisa à PokeAPI, incluindo filtros e paginação? Quais foram os principais desafios ou decisões interessantes nessa integração?

**Resposta:**

**Não foram implementados filtros nem paginação** na PokéAPI pela natureza do caso de uso.

A PokéAPI é consultada apenas quando um Pokémon precisa ser associado a um time. O fluxo é:

1. O cliente envia `{ "pokemonId": 25 }` — o `pokeApiId` (id numérico da PokéAPI).
2. O `PokemonGateway.fetchPokemon(pokeApiId)` faz uma chamada direta a `https://pokeapi.co/api/v2/pokemon/{id}`.
3. Os dados retornados (`name`, `sprite`, `height`, `weight`, `types`) são mapeados para a interface `PokemonData` e retornados ao Application Service.

Não há necessidade de busca por nome, listagem ou paginação porque o Pokémon já é identificado pelo seu ID numérico da PokéAPI — o cliente sabe qual Pokémon quer adicionar. Isso mantém a integração focada e evita expor complexidade desnecessária da PokéAPI.

**Estratégia de cache (TTL de 7 dias):**

O principal desafio dessa integração foi definir **quando consultar a PokéAPI vs. quando usar o banco local**. A solução foi:

1. **Campo `lastSyncedAt`** na entidade `Pokemon` — registra o timestamp da última sincronização.
2. **TTL configurável** via `POKEMON_CACHE_TTL` (default 604800 segundos = 7 dias).
3. **Fluxo no `TeamApplicationService.addPokemon()`**:
   - Pokémon existe no banco E `lastSyncedAt` está dentro do TTL → usa o dado local.
   - Pokémon existe no banco MAS `lastSyncedAt` expirou → busca da PokéAPI, atualiza o registro, reseta `lastSyncedAt`.
   - Pokémon não existe no banco → busca da PokéAPI, persiste novo registro.

**Endpoint de refresh manual** — `POST /api/v1/pokemons/:id/refresh` força uma re-sincronização independente do TTL, permitindo que o cliente atualize dados manualmente quando necessário.

**Tratamento de erros** — O gateway:
- Detecta 404 da PokéAPI e lança `NotFoundException` (Pokémon não existe).
- Detecta falhas de conexão/timeout e lança `ServiceUnavailableException`, evitando que erros transientes da API externa corrompam o estado interno.
