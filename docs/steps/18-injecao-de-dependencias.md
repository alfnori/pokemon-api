# Fase 18 — Injeção de Dependências

## Propósito

Garantir que a injeção de dependências respeite a arquitetura em camadas: Controller → Application Service → Domain Service → Repository.

## Avaliação

Nenhum controller injeta repositórios diretamente. Nenhum service de domínio depende de gateways. A hierarquia de injeção é unidirecional.

## Critérios

- Controllers injetam apenas Application Services
- Application Services injetam Domain Services, Repositories e Gateways
- Domain Services injetam apenas Repositories (não Gateways)
- Repositories injetam apenas `DataSource`/`Repository` do TypeORM
- Nenhum modulo importa outro modulo de domínio apenas para acessar repositórios
- Módulos exportam apenas o que outras camadas precisam consumir
- Dependências circulares entre módulos são eliminadas (refatorar se necessário)
- Uso consistente de `@Injectable()` em todas as classes de serviço
