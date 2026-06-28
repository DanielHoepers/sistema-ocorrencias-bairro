# Sistema de Ocorrências do Bairro

MVP inicial da plataforma comunitária para registro e acompanhamento de ocorrências do bairro.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Java 21 + Spring Boot 3
- Banco: PostgreSQL 15
- Containers: Docker Compose

## Funcionalidades desta primeira versão

- Cadastro e login de usuários
- Sessão por cookie HttpOnly
- Criar ocorrência
- Listar ocorrências
- Buscar por título, descrição ou categoria
- Editar ocorrência própria
- Excluir ocorrência própria com soft delete
- Administrador pode gerenciar ocorrências de todos os usuários
- Status da ocorrência: Aberta, Em análise, Resolvida, Arquivada
- Vínculo automático da ocorrência com o usuário logado

> Comentários, notificações e auditoria ficam para as próximas etapas.

## Rodar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/occurrences

Usuário administrador de desenvolvimento:

```text
E-mail: admin@bairro.local
Senha: Admin@12345
```

## Rodar em modo desenvolvimento

### Banco

```bash
docker compose up db
```

### Backend

Com Java 21 e Maven instalados:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse:

```text
http://localhost:5173
```
