Esse case é interessante porque **não está avaliando apenas NestJS**, mas principalmente sua capacidade de tomar decisões arquiteturais. Como você já trabalha com backend, microserviços e IA, eu faria um projeto que pareça um sistema real e não apenas um CRUD.

## O que eles provavelmente querem avaliar

Além do que está escrito, vão observar:

* organização do código
* separação de responsabilidades
* DDD (mesmo que leve)
* SOLID
* tratamento de erros
* TypeORM corretamente
* migrations
* Docker
* documentação
* testes (se houver)
* decisões justificadas

Ou seja, o README vale quase tanto quanto o código.

---

# Minha arquitetura

```
src
 ├── app.module.ts
 │
 ├── common
 │    ├── exceptions
 │    ├── filters
 │    ├── interceptors
 │    ├── decorators
 │    └── utils
 │
 ├── config
 │
 ├── trainer
 │     ├── controllers
 │     ├── services
 │     ├── repositories
 │     ├── dto
 │     ├── entities
 │     └── trainer.module.ts
 │
 ├── team
 │     ├── controllers
 │     ├── services
 │     ├── dto
 │     ├── entities
 │     └── team.module.ts
 │
 ├── pokemon
 │     ├── controllers
 │     ├── services
 │     ├── integrations
 │     ├── dto
 │     ├── entities
 │     └── pokemon.module.ts
 │
 ├── cep
 │     ├── cep.service.ts
 │     └── integrations
 │
 └── database
        ├── migrations
        └── seeds
```

---

# Modelagem

## Trainer

```
Trainer

id
name
email
cep

street
district
city
state

createdAt
updatedAt
deletedAt
```

Soft Delete.

---

## Team

```
Team

id
name

trainerId

createdAt
updatedAt
deletedAt
```

Relacionamento

```
Trainer 1 ---- N Team
```

---

## Pokemon

```
Pokemon

id

pokeApiId

name

sprite

height

weight

types (json)

lastSyncedAt

createdAt
updatedAt
```

Observe o

```
lastSyncedAt
```

Ele resolve praticamente todo o problema de cache.

---

## TeamPokemon

Nunca faça ManyToMany direto.

Faça uma entidade intermediária.

```
TeamPokemon

id

teamId

pokemonId

position

createdAt
```

Assim você consegue:

* ordenar
* adicionar campos futuramente
* impedir duplicidade

Crie índice único

```
(teamId, pokemonId)
```

Assim o banco impede Pokémon repetido.

---

# Banco

```
Trainer

1

N

Team

1

N

TeamPokemon

N

1

Pokemon
```

Muito limpo.

---

# Fluxo do Pokémon

O mais importante do desafio.

Quando adicionar um Pokémon:

```
POST

/team/1/pokemons

{
    "pokemonId":25
}
```

Service

```
Existe no banco?

↓

SIM

↓

lastSyncedAt < TTL ?

↓

SIM

↓

usa banco

↓

NÃO

↓

atualiza PokéAPI

↓

salva

↓

retorna
```

Se não existir:

```
PokéAPI

↓

persistir

↓

associar
```

---

# Estratégia de TTL

Eu faria:

```
TTL = 7 dias
```

No README:

> Sempre que um Pokémon for solicitado, a API consulta inicialmente o banco local.
>
> Caso os dados tenham sido sincronizados há menos de 7 dias, utiliza o cache local.
>
> Caso contrário, sincroniza novamente com a PokéAPI.

Isso mostra preocupação com:

* performance
* disponibilidade
* rate limit

---

# Endpoint manual

Além disso:

```
POST

/pokemons/:id/refresh
```

Força atualização.

Isso ganha muitos pontos.

---

# ViaCEP

Criaria um serviço separado.

```
CepService

↓

ViaCepClient

↓

HTTP
```

Ao criar treinador

```
POST

/trainers

{
   name
   email
   cep
}
```

Fluxo

```
Recebe CEP

↓

ViaCEP

↓

logradouro

bairro

cidade

estado

↓

persiste junto com Trainer
```

Assim consultas futuras não dependem do serviço externo.

---

# Regras

## Team máximo 5

```
SELECT COUNT

↓

>=5

↓

throw BadRequest
```

---

## Pokémon repetido

Verifica

```
TeamPokemon

WHERE

teamId

pokemonId
```

Existe?

```
throw ConflictException
```

Mesmo assim o índice único protege.

---

## Exclusão de treinador

Eu faria:

```
Soft Delete

+

bloquear exclusão se existirem times ativos
```

Porque demonstra regra de negócio.

```
Trainer

↓

tem teams?

↓

sim

↓

409 Conflict
```

Mensagem

```
Trainer possui times ativos.
```

Muito melhor que cascade.

---

## Exclusão de Team

Ao remover:

```
TeamPokemon

cascade

↓

Team
```

Os Pokémon permanecem.

Faz sentido.

---

# Controllers

```
POST /trainers

GET /trainers

GET /trainers/:id

PATCH /trainers/:id

DELETE /trainers/:id
```

---

```
POST /teams

GET /teams

GET /teams/:id

DELETE /teams/:id
```

---

```
POST /teams/:id/pokemons

DELETE /teams/:id/pokemons/:pokemonId
```

---

```
GET /pokemons/:id

POST /pokemons/:id/refresh
```

---

# Validações

Use

```
ValidationPipe

class-validator

class-transformer
```

Exemplo

```
@IsEmail()

@Length()

@Matches()

@IsPostalCode()
```

---

# TypeORM

Sempre use

```
Migrations
```

Nunca synchronize.

```
synchronize:false
```

---

# Docker

```
api

postgres

pgadmin
```

Já fica bonito.

---

# README

Eu faria os seguintes tópicos.

```
Arquitetura

Tecnologias

Como rodar

Docker

Migrations

Decisões arquiteturais

Modelo de dados

Integração PokéAPI

Estratégia de cache

Integração ViaCEP

Regras de negócio

Fluxo de sincronização

Endpoints

Melhorias futuras
```

---

# Melhorias futuras

Isso impressiona.

Exemplo:

* Redis para cache distribuído
* BullMQ para sincronização assíncrona
* Eventos de domínio
* CQRS
* Swagger
* Testes E2E
* Observabilidade (OpenTelemetry)
* Rate limiting
* Circuit Breaker para APIs externas
* Health Checks

---

## Diferenciais que podem destacar sua entrega

Como engenheiro backend sênior, eu adicionaria alguns elementos que costumam diferenciar um projeto:

* **Camada de integração isolada** (`PokeApiClient` e `ViaCepClient`), evitando chamadas HTTP diretamente nos services de negócio.
* **Repository Pattern** apenas quando agregar abstração útil, mantendo os services focados nas regras de negócio.
* **Configuração por variáveis de ambiente**, incluindo o TTL da sincronização dos Pokémon.
* **Tratamento centralizado de exceções** com um `ExceptionFilter` para padronizar respostas de erro.
* **Swagger/OpenAPI** para documentação automática da API.
* **Testes unitários** das regras principais (limite de 5 Pokémon, impedimento de duplicidade, sincronização da PokéAPI e bloqueio da exclusão de treinador).

Se o projeto for entregue dessa forma, ele deixa de parecer um "case de CRUD" e passa a transmitir a impressão de uma API pronta para evoluir em um ambiente de produção, que normalmente é o perfil esperado para uma vaga de Backend Sênior.
