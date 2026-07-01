# Fase 1 — Criando o Projeto

## Propósito

Inicializar o projeto NestJS e instalar todas as dependências necessárias para a aplicação.

## Avaliação

Verificar se o projeto compila, se as dependências corretas estão instaladas e se o ambiente de desenvolvimento está funcional.

## Critérios

- `yarn start:dev` executa sem erros
- Dependências obrigatórias presentes: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`, `class-validator`, `class-transformer`, `axios`, `@nestjs/axios`
- DevDependencies: `@nestjs/testing`, `@types/jest`, `@types/supertest`, `jest`, `ts-jest`, `supertest`, `ts-node`, `tsconfig-paths`
- `yarn test` executa e o teste Hello World passa
- `yarn test:e2e` executa e o teste Hello World passa
- `yarn build` compila sem erros
