# Sprint 0 – API de Usuários com Backend e Frontend

Aplicação completa com backend Express + TypeScript + DynamoDB e frontend Next.js 14, incluindo autenticação JWT (JWKS), autorização RBAC, testes automatizados e infraestrutura como código (Terraform).

**Grupo:** Ana Laura de Souza Lopes e Fernanda Farias Uberti

---

## 📋 Índice

- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Início Rápido](#-início-rápido)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API - Endpoints](#-api---endpoints)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Infraestrutura](#-infraestrutura)

---

## 🔧 Stack Tecnológica

### Backend
- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco de Dados:** AWS DynamoDB
- **Autenticação:** JWT (JWKS remoto)
- **Autorização:** RBAC (Role-Based Access Control)
- **Validação:** Zod
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **UI:** React 18
- **Estilização:** CSS Modules

### Infraestrutura
- **IaC:** Terraform
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud:** AWS (DynamoDB, Cognito, EC2, S3, VPC)

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│   Usuário       │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Frontend      │─────▶│    Backend API   │
│   Next.js       │      │    Express       │
│   Port: 3000    │◀─────│    Port: 3001    │
└─────────────────┘      └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │                  │
                         ▼                  ▼
                  ┌─────────────┐    ┌──────────┐
                  │  DynamoDB   │    │   JWKS   │
                  │  Port: 8000 │    │  Server  │
                  └─────────────┘    └──────────┘
```

**Fluxo de Dados:**
1. Frontend (Next.js) faz requisições HTTP para o Backend
2. Backend valida JWT via JWKS remoto
3. Backend verifica permissões RBAC
4. Backend acessa DynamoDB para operações CRUD
5. Backend retorna JSON para o Frontend

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18 ou superior
- Docker e Docker Compose (recomendado)
- npm ou yarn

### Opção 1: Docker Compose (Recomendado) 🐳

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd CS20252

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Acesse
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - API Docs: http://localhost:3001/api/docs
# - Health Check: http://localhost:3001/health
```

**Comandos úteis:**
```bash
# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Reconstruir
docker-compose up -d --build
```

### Opção 2: Desenvolvimento Local 💻

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações
npm run dev
```

Backend disponível em: `http://localhost:3001`

#### Frontend (em outro terminal)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend disponível em: `http://localhost:3000`

#### DynamoDB Local (em outro terminal)

```bash
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
```

---

## 📂 Estrutura do Projeto

```
CS20252/
│
├── backend/                      # 🔷 API REST
│   ├── src/
│   │   ├── api/                  # Rotas Express
│   │   │   ├── pets/             # CRUD pets
│   │   │   │   ├── route.ts      # GET/POST /pets
│   │   │   │   ├── routeUsers.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET/PUT/DELETE /pets/:id
│   │   │   │       └── routeUser.ts
│   │   │   └── docs/
│   │   │       └── route.ts      # Swagger UI
│   │   ├── lib/
│   │   │   ├── auth/             # Autenticação e autorização
│   │   │   │   ├── jwt.ts        # Validação JWT + JWKS
│   │   │   │   ├── rbac.ts       # Middleware RBAC
│   │   │   │   ├── permissions.ts
│   │   │   │   └── withAuth.ts
│   │   │   ├── dynamodb.ts       # Serviço DynamoDB para Pets
│   │   │   └── swagger.ts        # Config Swagger
│   │   ├── __tests__/            # Testes
│   │   │   ├── api.test.ts
│   │   │   ├── dynamodb.test.ts
│   │   │   └── jwks-mock.ts
│   │   ├── testUtils/
│   │   │   ├── api-mock.ts
│   │   │   └── jwks-mock.ts
│   │   └── index.ts              # Servidor Express
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── api-spec.yaml             # OpenAPI spec
│   └── .env.example
│
├── frontend/                     # 🎨 Aplicação Next.js
│   ├── src/
│   │   ├── app/                  # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/           # Componentes React
│   │   │   ├── Button.example.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── api.ts            # Cliente HTTP para API do backend
│   │   ├── hooks/
│   │   │   └── useApi.example.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── .env.example
│
├── infra/                        # ☁️ Infraestrutura
│   ├── Terraform/
│   │   ├── main.tf               # DynamoDB, Cognito, EC2, S3, VPC
│   │   ├── provider.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars.example
│   └── Docker/
│
├── scripts/
│   └── generate-swagger.cjs      # Geração de docs
│
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD Pipeline
│
├── docker-compose.yml            # Orquestração completa
├── package.json                  # Scripts raiz
├── .gitignore
└── README.md                     # Este arquivo
```

---

## 🗃️ API - Endpoints

Base URL: `http://localhost:3001/api`

### Autenticação

Todas as rotas (exceto `/health`) requerem autenticação via JWT:

```
Authorization: Bearer <seu-token-jwt>
```

### Endpoints Disponíveis

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/api/pets` | Público | Lista todos os pets |
| `POST` | `/api/pets` | Público | Cria um novo pet |
| `GET` | `/api/pets/:id` | Público | Busca pet por ID |
| `PUT` | `/api/pets/:id` | Público | Atualiza pet |
| `DELETE` | `/api/pets/:id` | Público | Remove pet |
| `GET` | `/health` | Público | Health check |
| `GET` | `/api/docs` | Público | Documentação Swagger |

### Exemplos de Requisição

#### Criar Pet
```bash
curl -X POST http://localhost:3001/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Rex",
    "foto": "https://example.com/rex.jpg",
    "idade": 3,
    "raca": "Labrador",
    "peso": 25.5,
    "medicacoes": "Antipulgas mensais",
    "informacoes": "Cachorro muito amigável"
  }'
```

#### Listar Pets
```bash
curl http://localhost:3001/api/pets
```

#### Atualizar Pet
```bash
curl -X PUT http://localhost:3001/api/pets/<pet-id> \
  -H "Content-Type: application/json" \
  -d '{
    "peso": 27.0,
    "medicacoes": "Antipulgas e vermífugo"
  }'
```

### Documentação Interativa

Acesse a documentação Swagger completa em:
**http://localhost:3001/api/docs**

---

## 💻 Desenvolvimento

### Scripts Disponíveis

#### Raiz do Projeto
```bash
# Instalar deps de backend e frontend
npm run install:all

# Rodar backend e frontend simultaneamente
npm run dev

# Rodar apenas backend
npm run dev:backend

# Rodar apenas frontend
npm run dev:frontend

# Build completo
npm run build

# Testes do backend
npm run test:backend

# Docker
npm run docker:up
npm run docker:down
npm run docker:logs
```

#### Backend (`cd backend`)
```bash
npm run dev        # Servidor em modo watch
npm run build      # Build TypeScript
npm start          # Rodar build de produção
npm test           # Executar testes
npm run lint       # Type checking
```

#### Frontend (`cd frontend`)
```bash
npm run dev        # Dev server
npm run build      # Build de produção
npm start          # Servidor de produção
npm run lint       # Linter
```

### Variáveis de Ambiente

#### Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=Pet
JWKS_URI=https://your-auth-provider.com/.well-known/jwks.json
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧪 Testes

### Backend

O backend possui cobertura completa de testes:

```bash
cd backend
npm test
```

**Arquivos de Teste:**
- `api.test.ts` - Testes de endpoints da API de pets
- `dynamodb.test.ts` - Testes de operações no banco
- `jwks-mock.ts` - Mock server JWKS para testes

**Cobertura:**
- ✅ CRUD completo de pets
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Validação de schemas

### CI/CD

GitHub Actions executa automaticamente:
1. Instalação de dependências
2. Type checking
3. Build do projeto
4. Testes com DynamoDB local
5. Lint

---

## 🚢 Deploy

### Backend

#### Docker
```bash
cd backend
docker build -t cs20252-backend .
docker run -p 3001:3001 --env-file .env cs20252-backend
```

#### Produção (EC2/Container)
1. Configure as variáveis de ambiente de produção
2. Aponte `DYNAMODB_ENDPOINT` para DynamoDB AWS real
3. Configure `JWKS_URI` para seu provedor de autenticação
4. Execute `npm run build && npm start`

### Frontend

#### Docker
```bash
cd frontend
docker build -t cs20252-frontend .
docker run -p 3000:3000 cs20252-frontend
```

#### Vercel (Recomendado para Next.js)
```bash
cd frontend
npm install -g vercel
vercel
```

Configure a variável `NEXT_PUBLIC_API_URL` apontando para sua API em produção.

---

## ☁️ Infraestrutura

### Terraform

O projeto inclui infraestrutura completa como código:

```bash
cd infra/Terraform

# Inicializar
terraform init

# Planejar mudanças
terraform plan

# Aplicar
terraform apply
```

**Recursos Provisionados:**
- ✅ DynamoDB Table (`Pet`)
- ✅ EC2 para backend
- ✅ S3 para frontend estático
- ✅ VPC e Security Groups
- ✅ IAM Roles e Policies

### DynamoDB

**Estrutura da Tabela `Pet`:**
- `petId` (String, PK) - UUID
- `nome` (String) - Nome do pet
- `foto` (String) - URL da foto
- `idade` (Number) - Idade em anos
- `raca` (String) - Raça do pet
- `peso` (Number) - Peso em kg
- `medicacoes` (String) - Medicações
- `informacoes` (String) - Informações adicionais
- `createdAt` (String) - ISO timestamp
- `updatedAt` (String) - ISO timestamp

---

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs

#### Docker
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

---

## 🔒 Segurança

- ✅ JWT com validação via JWKS remoto
- ✅ RBAC com roles (admin/user)
- ✅ Validação de entrada com Zod
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Variáveis sensíveis em .env
- ✅ Sanitização de erros em produção

---

## 📝 Convenções de Código

### Commits Semânticos

```bash
feat(backend): add user email validation
fix(frontend): correct API endpoint URL
test(api): add RBAC integration tests
docs: update README with deployment steps
refactor(auth): simplify JWT verification
chore: update dependencies
```

### TypeScript

- Use interfaces para tipos complexos
- Evite `any`, use `unknown` quando necessário
- Use tipos estritos (`strict: true`)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📚 Recursos Adicionais

### Documentação
- [Next.js](https://nextjs.org/docs)
- [Express](https://expressjs.com/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Terraform](https://www.terraform.io/docs)
- [JWT/JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens)

### Ferramentas Úteis
- [DynamoDB Admin](https://www.npmjs.com/package/dynamodb-admin) - UI para DynamoDB local
- [Postman](https://www.postman.com/) - Testar API
- [AWS CLI](https://aws.amazon.com/cli/) - Gerenciar recursos AWS

---

## 📄 Licença

Este projeto é desenvolvido como parte do curso de Construção de Software da PUCRS.

---

## 👥 Autores

**Ana Laura de Souza Lopes e Fernanda Farias Uberti**  
Construção de Software - PUCRS - 2025

---

## 🆘 Suporte

Para problemas, dúvidas ou sugestões:
1. Consulte a documentação acima
2. Verifique a [documentação da API](http://localhost:3001/api/docs)
3. Abra uma issue no repositório

---

**Pronto para desenvolver! 🚀**

---

## 🚀 Como Executar

### Opção 1: Usando Docker Compose (Recomendado)

Esta é a forma mais fácil de rodar todo o projeto (backend + frontend + DynamoDB):

1. **Configure as variáveis de ambiente:**

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env.local
```

2. **Inicie todos os serviços:**

```bash
docker-compose up -d
```

Isso iniciará:
- Backend API em **http://localhost:3001**
- Frontend em **http://localhost:3000**
- DynamoDB local em **http://localhost:8000**

3. **Para parar:**

```bash
docker-compose down
```

---

### Opção 2: Rodando Localmente (Desenvolvimento)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Ajuste as variáveis no .env conforme necessário
npm run dev
```

O backend estará em **http://localhost:3001**

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

O frontend estará em **http://localhost:3000**

#### DynamoDB Local (opcional)

```bash
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
```

---

## 🗃️ Rotas da API

Todas as rotas estão sob o prefixo `/api/users`.  
A autenticação é feita via JWT (`Authorization: Bearer <token>`).

| Método | Rota | Acesso | Descrição | Payload de Exemplo |
|:-------|:------|:--------|:-----------|:------------------|
| `GET` | `/api/users` | **Admin** | Lista todos os usuários ordenados por data de criação (desc). | — |
| `POST` | `/api/users` | **Admin** | Cria um usuário com `name` e `email` (único). | `{ "name": "João", "email": "joao@exemplo.com" }` |
| `GET` | `/api/users/:id` | **Self/Admin** | Retorna um usuário por ID. | — |
| `PUT` | `/api/users/:id` | **Self/Admin** | Atualiza nome/e-mail de um usuário. | `{ "name": "Maria", "email": "maria@novo.com" }` |
| `DELETE` | `/api/users/:id` | **Admin** | Remove usuário pelo ID. | — |

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer <token-admin>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com"}'
```

### Documentação Interativa

Acesse a documentação Swagger da API em:
- **http://localhost:3001/api/docs**

---

## 🔐 Autenticação e Autorização (RBAC)

A autenticação é baseada em **JWT** com verificação via **JWKS remoto**.  
O middleware `requireAdmin` e `requireSelfOrAdmin` garantem acesso restrito a papéis e identidades.

- `401` → token ausente ou inválido  
- `403` → usuário sem permissão (não admin / não self)  
- `200` → acesso concedido  

---

## 💾 Persistência – AWS DynamoDB

Os dados são armazenados na tabela `clients`, definida via Terraform.  
O serviço `dynamoDBService` implementa as operações CRUD:

- `createClient({ name, email })`  
- `getClientById(id)`  
- `getAllClients()`  
- `updateClient(id, data)`  
- `deleteClient(id)`

O campo `createdAt` é utilizado para ordenação.  
Cada item é identificado por um `id` UUID gerado automaticamente.

---

## ☁️ Infraestrutura (Terraform)

A infraestrutura AWS é definida como código em `infra/main.tf`:

- ✅ DynamoDB (`clients`)  
- ✅ Cognito User Pool (autenticação)  
- ✅ EC2 (deploy da API)  
- ✅ S3 (estáticos e logs)  
- ✅ VPC e Security Groups  

Para provisionar:

```bash
cd infra
terraform init
terraform apply
```

---

## 🧪 Testes

Os testes do backend utilizam **Jest** e **Supertest**, cobrindo:

| Arquivo | Escopo |
|----------|--------|
| `dynamodb.test.ts` | CRUD DynamoDB |
| `api.test.ts` | Endpoints + RBAC |
| `users.auth.test.ts` | Integração JWT + JWKS mock |

Para executar os testes:

```bash
cd backend
npm test
```

Os testes de integração utilizam um servidor JWKS mock (`testUtils/jwks-mock.ts`) e um DynamoDB local.

---

## ⚙️ CI/CD (GitHub Actions)

O workflow `.github/workflows/ci.yml` executa:

1. Instalação de dependências  
2. Typecheck e lint  
3. Build do projeto  
4. Subida de serviço DynamoDB local  
5. Execução dos testes automatizados  

O deploy pode ser automatizado com push na branch `main`, usando as credenciais AWS configuradas no repositório.

---

## 📘 Commits Recomendados

Use commits semânticos para manter o histórico limpo:

- `feat(api): add JWT RBAC middleware`
- `feat(dynamodb): implement CRUD client service`
- `test(api): add integration tests with mock JWKS`
- `infra(terraform): add DynamoDB and Cognito resources`
- `ci: setup GitHub Actions with DynamoDB local`
- `docs: update README for Sprint 1`
- `refactor: separate backend and frontend`

---

## 🚀 Guia de Início Rápido

Para começar rapidamente, veja o **[QUICKSTART.md](./QUICKSTART.md)** que contém:
- Instruções passo a passo para instalação
- Diferentes formas de executar o projeto
- Solução de problemas comuns
- Comandos úteis

---

## 📖 Documentação Adicional

- **Backend**: Veja [backend/README.md](./backend/README.md) para detalhes da API
- **Frontend**: Veja [frontend/README.md](./frontend/README.md) para desenvolvimento do frontend
- **Infraestrutura**: Veja [infra/](./infra/) para configurações de Terraform e Docker

---

## 🏗️ Arquitetura

```
┌─────────────┐      HTTP       ┌─────────────┐
│   Frontend  │ ───────────────> │   Backend   │
│  (Next.js)  │     REST API     │  (Express)  │
│  Port 3000  │ <─────────────── │  Port 3001  │
└─────────────┘      JSON        └──────┬──────┘
                                        │
                                        │ AWS SDK
                                        ▼
                                 ┌─────────────┐
                                 │  DynamoDB   │
                                 │  Port 8000  │
                                 └─────────────┘
```

---

💡 **Grupo:**  
Ana Laura de Souza Lopes e Fernanda Farias Uberti