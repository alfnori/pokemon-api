# Fase 12 — Configuração Global

## Propósito

Configurar pipes, filtros, interceptors e middleware globais no `main.ts`.

## Avaliação

A aplicação possui configurações consistentes aplicadas globalmente, garantindo validação uniforme, tratamento de erros padronizado e CORS habilitado.

## Critérios

- `app.setGlobalPrefix('api/v1')` define prefixo global
- `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- `HttpExceptionFilter` global (ou uso de `app.useGlobalFilters()`) padroniza resposta de erro
- CORS habilitado (`app.enableCors()`)
- `Logger` global configurado
- Swagger/OpenAPI configurado com `@nestjs/swagger` (título, descrição, versão)
- Porta lida do `ConfigService` ou fallback para 3000
- `app.listen()` usa host `0.0.0.0` para funcionar no Docker
