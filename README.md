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

### Comandos

**Primeira vez:**
```bash
cd sprint0-app
npm install
docker-compose up -d db
npx prisma generate
npx prisma db push
npm run dev
```

**Das próximas vezes:**
```bash
docker-compose up -d db
npm run dev
```

---

Você pode rodar o projeto de duas formas: via **Docker** (recomendado) ou localmente.

### ✅ Setup Inicial (Primeira vez)

1. **Clone o repositório e navegue para o diretório:**
```bash
cd sprint0-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o ambiente:**
   - O arquivo `.env` já está configurado com PostgreSQL
   - Não é necessário alterar nada se você seguir os próximos passos

### 🐳 Rodando com PostgreSQL (Recomendado)

**Para sempre rodar a aplicação com dados persistentes:**

1. **Inicie o Docker Desktop** (aplicação gráfica)

2. **Suba apenas o PostgreSQL:**
```bash
docker-compose up -d db
```

3. **Verifique se o PostgreSQL está rodando:**
```bash
docker ps
```

4. **Configure o banco de dados:**
```bash
npx prisma generate
npx prisma db push
```

5. **Inicie a aplicação:**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000` com dados persistentes no PostgreSQL.

### 🔄 Comandos para sempre rodar

**Se a aplicação já foi configurada antes, use apenas:**

```bash
# 1. Suba o PostgreSQL
docker-compose up -d db

# 2. Inicie a aplicação
npm run dev
```

### 🛠️ Comandos Úteis

**Parar processo na porta 3000:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Ver usuários cadastrados:**
```bash
node listar-usuarios.js
```

**Parar PostgreSQL:**
```bash
docker-compose down
```

**Ver logs do PostgreSQL:**
```bash
docker-compose logs db
```

### 💻 Alternativa: Rodando localmente (sem Docker)

⚠️ **Não recomendado para desenvolvimento em equipe** - Os dados não serão compartilhados.

Para rodar sem Docker você precisa ter Node.js (>=20) e PostgreSQL instalado localmente.

1. Configure PostgreSQL local e ajuste o `.env` com sua connection string
2. Execute as migrações: `npm run migrate`  
3. Inicie: `npm run dev`



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

3. Inicie: `npm run dev`

O servidor ficará disponível em `http://localhost:3000`.

## 🔧 Solução de Problemas

### Erro: "address already in use :::3000"
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Erro: "Cannot connect to the Docker daemon"
1. Abra o Docker Desktop (aplicação gráfica)
2. Aguarde inicializar completamente
3. Execute: `docker ps` para verificar

### PostgreSQL não conecta
```bash
# Verifique se está rodando
docker ps

# Se não estiver, suba novamente
docker-compose up -d db

# Verifique os logs
docker-compose logs db
```

### Banco de dados desatualizado
```bash
npx prisma db push
npx prisma generate
```

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


Exemplo com `curl` para listar todos usuários usuário:

```bash
curl -X GET http://localhost:3000/api/users | jq
```

Exemplo com `curl` para buscar um usuário específico:

```bash
curl -X GET http://localhost:3000/api/users/id

Exemplo com `curl` para deletar um usuário:

# Primeiro, pegue o ID do usuário
```bash
curl -s http://localhost:3000/api/users | jq '.[] | {id, name, email}'
```

# Depois delete usando o ID
```bash
curl -X DELETE http://localhost:3000/api/users/ID_DO_USUARIO
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
