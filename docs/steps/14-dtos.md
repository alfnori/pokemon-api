# Fase 14 — DTOs

## Propósito

Criar DTOs de entrada e saída para cada endpoint, garantindo que entidades do banco nunca sejam expostas nas respostas HTTP.

## Avaliação

Toda requisição validada por DTOs com `class-validator` e toda resposta construída como DTO (nunca uma entidade).

## Critérios

- DTOs de entrada com decorators `@IsString()`, `@IsEmail()`, `@IsInt()`, `@IsPostalCode()`, `@Length()`, `@Matches()` etc.
  - `CreateTrainerDto`: `name`, `email`, `cep`
  - `UpdateTrainerDto`: `name`, `email`, `cep` (todos opcionais)
  - `CreateTeamDto`: `name`, `trainerId`
  - `AddPokemonDto`: `pokemonId`
  - `RefreshPokemonDto` (se necessário)
- DTOs de saída sem referência a entidades:
  - `TrainerResponseDto`, `TeamResponseDto`, `PokemonResponseDto`, `TeamPokemonResponseDto`
  - Incluem campos relevantes, datas formatadas e relações simplificadas
- Nenhum controller retorna `Promise<Trainer>` ou `Promise<Team>` diretamente
- DTOs usam `@ApiProperty()` do Swagger para documentação automática
