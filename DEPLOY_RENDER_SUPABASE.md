# Hospedagem com HTTPS no Render + Supabase

Este roteiro coloca o projeto no ar com HTTPS usando:

- Supabase para o banco PostgreSQL
- Render Web Service para o backend Spring Boot
- Render Static Site para o frontend React

O Render gera HTTPS automaticamente para os enderecos `onrender.com`.

## 1. Preparar o banco no Supabase

1. Crie um projeto no Supabase.
2. Abra `Project Settings > Database`.
3. Copie os dados de conexao do Postgres.
4. Prefira a conexao com SSL e pooler se o painel oferecer essa opcao.

No backend, o formato esperado fica assim:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://SEU_HOST:6543/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.SEU_PROJECT_REF
SPRING_DATASOURCE_PASSWORD=SENHA_DO_BANCO
```

## 2. Subir o backend no Render

No Render:

1. Clique em `New > Web Service`.
2. Conecte o repositorio do projeto.
3. Configure:
   - Runtime: Docker
   - Root Directory: `backend`
   - Health Check Path: `/api/health`
   - Plan: Free, se disponivel para sua conta

Variaveis importantes:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://SEU_HOST:6543/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.SEU_PROJECT_REF
SPRING_DATASOURCE_PASSWORD=SENHA_DO_BANCO
APP_CORS_ALLOWED_ORIGINS=https://SEU_FRONTEND.onrender.com
APP_CORS_ALLOWED_ORIGIN_PATTERNS=
APP_JWT_SECRET=GERE_UMA_CHAVE_FORTE_COM_PELO_MENOS_64_CARACTERES
APP_AUTH_COOKIE_SECURE=true
APP_AUTH_COOKIE_SAME_SITE=None
APP_ADMIN_CREATE_ENABLED=true
APP_ADMIN_NAME=Daniel Hoepers
APP_ADMIN_EMAIL=danielrch.hoepers@gmail.com
APP_ADMIN_PASSWORD=UMA_SENHA_FORTE_TEMPORARIA
```

Depois que o primeiro administrador for criado e voce conseguir entrar no sistema, volte no Render e troque:

```text
APP_ADMIN_CREATE_ENABLED=false
```

## 3. Subir o frontend no Render

No Render:

1. Clique em `New > Static Site`.
2. Conecte o mesmo repositorio.
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`

Variavel do frontend:

```text
VITE_API_URL=https://SEU_BACKEND.onrender.com/api
```

Tambem configure uma regra de rewrite para SPA:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## 4. Ajustar CORS depois dos links reais

Quando o Render criar os links, volte no backend e ajuste:

```text
APP_CORS_ALLOWED_ORIGINS=https://URL_REAL_DO_FRONTEND.onrender.com
```

Depois rode um novo deploy do backend.

## 5. Testes finais

1. Abra `https://SEU_BACKEND.onrender.com/api/health`.
2. Deve aparecer `status: ok`.
3. Abra o frontend em HTTPS.
4. Crie login ou entre com o administrador inicial.
5. Crie uma ocorrencia.
6. Atualize a pagina com F5.
7. Confirme que continua logado.
8. No painel de administracao, confira os logs do sistema.

## Cuidados importantes

- Nao suba `.env` real para o GitHub.
- Use senha forte no banco.
- Use `APP_JWT_SECRET` grande e aleatorio.
- Use `APP_AUTH_COOKIE_SECURE=true` em HTTPS.
- Use `APP_AUTH_COOKIE_SAME_SITE=None` porque frontend e backend ficam em dominios diferentes.
- Desligue `APP_ADMIN_CREATE_ENABLED` depois de criar o primeiro administrador.
