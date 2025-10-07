# Sprint 0 – Setup de Time, Stack e Projeto

Este repositório implementa a Sprint 0 de uma aplicação base utilizando **Next.js** com **TypeScript**, **Prisma ORM** e **PostgreSQL**. O objetivo é prover uma estrutura mínima, pronta para desenvolvimento incremental com testes, CI e orquestração via Docker.

## 🔧 Stack

- **Linguagem:** TypeScript
- **Framework:** React com Next.js (App Router)
- **Banco:** PostgreSQL (via Prisma ORM)

## 📂 Estrutura de Pastas

```
.
├─ .github/workflows/ci.yml       # Pipeline de integração contínua
├─ prisma/
│  ├─ schema.prisma              # Definição do modelo e datasource
│  └─ migrations/…               # Migrações geradas pelo Prisma
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  └─ users/
│  │  │     ├─ [id]/route.ts     # Rotas GET/PUT/DELETE por ID
│  │  │     └─ route.ts          # Rotas GET/POST de usuários
│  │  └─ page.tsx                # Página inicial simples
│  └─ lib/                       # (reservado para utilidades futuras)
├─ __tests__/users.api.test.ts    # Testes de integração das rotas
├─ docker-compose.yml             # Orquestração de app e banco
├─ Dockerfile                     # Build para produção
├─ jest.config.ts                 # Configuração do Jest
├─ package.json                   # Dependências e scripts
├─ tsconfig.json                  # Configuração TypeScript
├─ .env.example                   # Exemplo de variáveis de ambiente
└─ README.md                      # Este guia
```

## 🚀 Como Executar

Você pode rodar o projeto de duas formas: via **Docker** (recomendado) ou localmente.

### Rodando com Docker

1. Copie `.env.example` para `.env` e ajuste a variável `DATABASE_URL` se necessário. Por padrão ela aponta para o serviço `db` do docker-compose.
2. Execute:

```bash
docker compose up -d
```

Isso irá subir um container PostgreSQL e o app Next.js já com as migrações aplicadas. O aplicativo ficará acessível em `http://localhost:3000`.

### Rodando localmente

Para rodar sem Docker você precisa ter Node JS (>=20) e um banco PostgreSQL disponíveis.

1. Instale as dependências:

```bash
npm install
```

2. Ajuste a variável `DATABASE_URL` em um arquivo `.env` apontando para seu banco local, por exemplo:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
```

3. Execute as migrações:

```bash
npm run migrate
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

## 🗃️ Rotas da API

Todas as rotas estão sob o prefixo `/api/users`.

| Método | Rota              | Descrição                                                     | Payload de exemplo |
|-------:|:------------------|:--------------------------------------------------------------|:-------------------|
| `GET`  | `/api/users`      | Lista todos os usuários ordenados por criação (desc).         | —                 |
| `POST` | `/api/users`      | Cria um usuário. Campos `name` e `email` são obrigatórios.    | `{ "name": "João", "email": "joao@exemplo.com" }` |
| `GET`  | `/api/users/:id`   | Busca um usuário pelo `id`. Retorna 404 se não existir.        | —                 |
| `PUT`  | `/api/users/:id`   | Atualiza `name` e/ou `email` de um usuário existente.         | `{ "name": "João Atualizado", "email": "novo@exemplo.com" }` |
| `DELETE` | `/api/users/:id` | Remove um usuário pelo `id`. Retorna 404 se não existir.      | —                 |

Exemplo com `curl` para criar um usuário:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com"}'
```

## 🧪 Testes

Os testes utilizam **Jest** e **supertest** para validar as rotas da API. Para executá‑los:

```bash
npm test
```

Certifique‑se de que a variável `DATABASE_URL` de testes aponta para um banco isolado. O pipeline de CI já configura `DATABASE_URL` para `appdb_ci`.

## 🛠️ CI (GitHub Actions)

O workflow em `.github/workflows/ci.yml` executa automaticamente os passos de instalação, migrações, lint, typecheck, build e testes a cada push ou pull request. Um serviço PostgreSQL é disponibilizado durante a execução para que os testes possam interagir com o banco.

---

💡 *Commits semânticos são recomendados para manter o histórico organizado.* Exemplos:

- `chore: init nextjs app with ts config`
- `feat(api): implement users CRUD with prisma`
- `test(api): add users CRUD integration tests`
- `ci: add github actions workflow`
- `docs: add README with run/test instructions`
- `chore(docker): add dockerfile and compose with postgres`