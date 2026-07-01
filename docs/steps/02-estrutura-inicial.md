# Fase 2 — Estrutura Inicial

## Propósito

Criar a estrutura de diretórios do projeto, organizando os módulos e camadas antes de implementar qualquer lógica.

## Avaliação

A árvore de diretórios reflete a arquitetura planejada e cada módulo possui sua estrutura de pastas consistente.

## Critérios

- Diretórios criados em `src/`: `config/`, `common/`, `database/`, `trainer/`, `team/`, `pokemon/`, `cep/`
- Cada módulo de domínio (`trainer`, `team`, `pokemon`) possui subpastas: `controllers/`, `services/`, `repositories/`, `dto/`, `entities/`
- `common/` possui subpastas: `exceptions/`, `filters/`, `interceptors/`, `decorators/`, `utils/`
- `cep/` possui subpastas: `services/` e `gateways/` (ou `integrations/`)
- `database/` possui subpastas: `migrations/` e `seeds/`
- `config/` vazio aguardando arquivos de configuração
