Como você já é um desenvolvedor Backend Sênior, eu seguiria uma abordagem de **Clean Architecture + DDD leve**, sem exagerar na abstração. O objetivo é mostrar domínio do NestJS, TypeORM e boas práticas, sem transformar um case em um framework próprio.

A arquitetura que eu utilizaria seria esta:

```
Controller
      │
      ▼
Application Service
      │
      ▼
Domain Services (Regras de negócio)
      │
      ▼
Repositories
      │
      ▼
TypeORM
      │
      ▼
PostgreSQL
```

E para integrações externas:

```
PokemonService
        │
        ▼
PokemonGateway
        │
        ▼
PokéAPI
```

```
TrainerService
        │
        ▼
CepGateway
        │
        ▼
ViaCEP
```

---

# Fase 1 — Criando o projeto

```bash
nest new pokemon-api
```

Instale as dependências

```bash
npm install \
@nestjs/typeorm \
typeorm \
pg \
@nestjs/config \
class-validator \
class-transformer \
axios \
@nestjs/axios

npm install -D @types/node
```

---

# Fase 2 — Estrutura inicial

```
src/

app.module.ts

config/

common/

database/

trainer/

team/

pokemon/

cep/
```

A ideia é manter tudo organizado desde o início.

---

# Fase 3 — Configuração

```
config/

database.config.ts

env.validation.ts

configuration.ts
```

Exemplo

```
DATABASE_HOST

DATABASE_PORT

DATABASE_USER

DATABASE_PASSWORD

DATABASE_NAME

POKE_API

CEP_API

POKEMON_CACHE_TTL
```

No `AppModule`

```
ConfigModule.forRoot({
    isGlobal:true,
    load:[configuration]
})
```

Assim nenhuma classe lê diretamente `process.env`.

---

# Fase 4 — Banco

```
database/

typeorm.config.ts

migrations/

seed/
```

Nunca use

```
synchronize:true
```

Sempre

```
synchronize:false
```

E utilize migrations.

---

# Fase 5 — Organização dos módulos

Cada módulo possui exatamente a mesma estrutura.

Exemplo

```
trainer

controller

service

repository

dto

entity

interfaces
```

Isso facilita bastante a manutenção.

---

# Fase 6 — Configurando o TypeORM

Crie um DatabaseModule.

```
DatabaseModule

↓

TypeOrmModule.forRootAsync()

↓

ConfigService

↓

DataSource
```

Assim toda configuração fica centralizada.

---

# Fase 7 — Camada de domínio

Aqui está a parte que normalmente diferencia um projeto sênior.

Muita gente faz:

```
Controller

↓

Repository
```

Você deve evitar isso.

Faça:

```
Controller

↓

Application Service

↓

Domain Service

↓

Repository
```

---

## Application Service

Responsável por orquestrar casos de uso.

Exemplo

```
TrainerApplicationService

↓

CreateTrainer

↓

UpdateTrainer

↓

DeleteTrainer

↓

FindTrainer
```

Ele conversa com vários serviços.

---

## Domain Service

Implementa regras de negócio.

Por exemplo

```
TeamDomainService
```

Possui métodos

```
validateTeamLimit()

validateDuplicatePokemon()

validateTrainer()

removePokemon()

removeTeam()
```

Ele não conhece HTTP.

Não conhece Controller.

Só conhece regras.

---

# Fase 8 — Repository

Nunca coloque regra de negócio aqui.

Somente persistência.

```
TeamRepository

save()

findById()

findByTrainer()

countPokemon()

existsPokemon()

delete()
```

---

# Fase 9 — Gateways

Toda integração externa deve ser encapsulada.

```
PokemonGateway

↓

fetchPokemon()
```

Internamente

```
HttpService

↓

PokéAPI
```

O restante do sistema nem sabe que existe uma API externa.

O mesmo para CEP.

```
CepGateway

↓

searchByCep()
```

---

# Fase 10 — Services

Agora começa a orquestração.

Exemplo

Adicionar Pokémon.

```
Controller

↓

PokemonApplicationService

↓

TeamDomainService

↓

PokemonRepository

↓

PokemonGateway

↓

TeamRepository

↓

save()
```

Cada camada possui apenas uma responsabilidade.

---

# Fase 11 — Fluxo completo

Imagine

```
POST

/team/1/pokemon
```

Fluxo

```
Controller

↓

DTO

↓

ValidationPipe

↓

ApplicationService

↓

TeamRepository

↓

Team existe?

↓

PokemonRepository

↓

Existe pokemon?

↓

Não

↓

PokemonGateway

↓

PokéAPI

↓

save()

↓

TeamDomainService

↓

time cheio?

↓

pokemon repetido?

↓

TeamPokemonRepository

↓

save()

↓

Response
```

Esse fluxo é praticamente o coração do sistema.

---

# Fase 12 — Configuração Global

No `main.ts`

```
ValidationPipe

Global Filters

Global Exception

CORS

Swagger

Prefix api/v1
```

Algo como

```
app.setGlobalPrefix("api");

app.useGlobalPipes()

app.useGlobalFilters()

app.enableCors()
```

---

# Fase 13 — Exceções

Crie

```
common/

exceptions/

pokemon-not-found.exception.ts

trainer-not-found.exception.ts

team-full.exception.ts

pokemon-duplicated.exception.ts
```

Muito melhor que lançar

```
throw new BadRequest()
```

por toda parte.

---

# Fase 14 — DTOs

Nunca exponha Entity.

Sempre

```
DTO

↓

Service

↓

Entity

↓

Repository
```

E na volta

```
Entity

↓

Mapper

↓

Response DTO
```

---

# Fase 15 — Mappers

Uma camada esquecida por muitos.

```
TrainerMapper

↓

Entity -> DTO

DTO -> Entity
```

Assim nunca mistura objetos do banco com respostas HTTP.

---

# Fase 16 — Cache Pokémon

O fluxo ideal é

```
PokemonService

↓

Repository

↓

Existe?

↓

Sim

↓

TTL expirou?

↓

Não

↓

Retorna

↓

Sim

↓

Gateway

↓

Atualiza

↓

Save

↓

Retorna
```

Observe que toda essa lógica fica em um único lugar.

---

# Fase 17 — Transações

Sempre que alterar múltiplas entidades relacionadas (por exemplo, criar um Pokémon local e associá-lo a um time), envolva a operação em uma transação do TypeORM para garantir consistência. Em casos simples de leitura seguida de uma única gravação, a transação pode não ser necessária.

---

# Fase 18 — Injeção de Dependências

Nunca injete repositórios em controllers.

O controller conhece apenas o Application Service.

```
Controller

↓

Application Service

↓

Domain Service

↓

Repository
```

Isso deixa o sistema extremamente desacoplado.

---

# Fase 19 — Fluxo de Dependências

Ao final, a arquitetura fica assim:

```text
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

## Ordem recomendada de implementação

Para maximizar produtividade e reduzir retrabalho, eu seguiria esta sequência:

1. Inicializar o projeto NestJS e configurar Docker, PostgreSQL e TypeORM.
2. Configurar `ConfigModule`, variáveis de ambiente e `DatabaseModule`.
3. Criar as entidades e gerar as migrations.
4. Implementar os repositórios.
5. Desenvolver os serviços de domínio com as regras de negócio.
6. Criar os gateways de integração (`PokemonGateway` e `CepGateway`).
7. Implementar os casos de uso (Application Services).
8. Criar os controllers e DTOs.
9. Adicionar tratamento global de exceções, validações e logging.
10. Documentar com Swagger e elaborar um README explicando as decisões arquiteturais.

Essa sequência produz um projeto incremental, em que cada etapa adiciona uma camada funcional sobre uma base sólida, e evidencia para os avaliadores que você domina não apenas o framework, mas também a organização e evolução de uma aplicação backend em um contexto próximo ao de produção.
