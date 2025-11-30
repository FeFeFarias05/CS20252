# API de Agenda de Pets

Sistema de gerenciamento de agenda para clínica veterinária utilizando Next.js, TypeScript e AWS DynamoDB. Implementa autenticação JWT com JWKS, autorização RBAC, paginação e testes automatizados.

## Stack Técnica

- **Runtime:** Node.js 20
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** AWS DynamoDB
- **Autenticação:** JWT (biblioteca jose, JWKS remoto)
- **Infraestrutura:** Terraform
- **Testes:** Jest + Supertest
- **CI/CD:** GitHub Actions

## Domínio

Sistema de agenda veterinária com 4 entidades principais:

### Client (Legado)
- `clientId`: UUID
- `name`, `email`, `phone`
- `createdAt`: ISO timestamp

### Owner (Dono do Pet)
- `ownerId`: UUID
- `name`, `email` (único), `phone`, `address`
- `createdAt`: ISO timestamp

### Pet
- `petId`: UUID
- `ownerId`: Referência ao dono
- `name`, `species` (cachorro, gato, etc.), `breed`, `birthDate`, `weight`, `notes`
- `createdAt`: ISO timestamp

### Appointment (Compromisso)
- `appointmentId`: UUID
- `petId`: Referência ao pet
- `ownerId`: Referência ao dono
- `date` (YYYY-MM-DD), `time` (HH:MM), `type` (consulta, vacina, banho, tosa), `status` (agendado, confirmado, cancelado, concluído), `veterinarian`, `notes`
- `createdAt`: ISO timestamp

## Relacionamentos

```
Owner (1) ──< (N) Pet (1) ──< (N) Appointment
   │                              │
   └──────────────────────────────┘
```

Regras de integridade:
- Owner não pode ser deletado se tiver pets associados
- Pet não pode ser deletado se tiver appointments
- Appointment valida que pet pertence ao owner informado
- Email do owner deve ser único no sistema

## Variáveis de Ambiente

```bash
# JWT
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/{user_pool_id}
JWT_AUDIENCE=https://api.cs20252
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/{user_pool_id}/.well-known/jwks.json

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB
DYNAMODB_TABLE_NAME=Client
DYNAMODB_ENDPOINT=http://localhost:8000  # Apenas para desenvolvimento local

# Node
NODE_ENV=development|test|production
```  

---

## 📂 Estrutura de Pastas

```
.
├─ .github/workflows/ci.yml        # Pipeline de integração contínua
├─ infra/                          # Provisionamento IaC (Terraform)
│  ├─ main.tf                      # DynamoDB, Cognito, EC2, S3, VPC
│  └─ variables.tf                 # Variáveis e outputs
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  └─ users/
│  │  │     ├─ [id]/route.ts       # Rotas GET/PUT/DELETE protegidas
│  │  │     └─ route.ts            # Rotas GET/POST de usuários (admin)
│  │  └─ page.tsx                  # Página inicial simples
│  ├─ lib/
│  │  ├─ auth/
│  │  │  ├─ jwt.ts                 # Verificação JWT via JWKS remoto
│  │  │  └─ rbac.ts                # Middleware RBAC (admin/self)
│  │  └─ dynamodb.ts               # Serviço de acesso ao DynamoDB
├─ tests/
│  ├─ api.test.ts                  # Testes RBAC e endpoints
│  ├─ dynamodb.test.ts             # Testes unitários do DynamoDB
│  ├─ user.auth.test.ts            # Integração JWT + JWKS mock
│  ├─ auth.test.ts                 # Middleware de autenticação
│  └─ jwks-mock.ts                 # Servidor mock JWKS
├─ jest.config.ts                  # Configuração Jest
├─ package.json                    # Scripts e dependências
├─ tsconfig.json                   # Configuração TypeScript
├─ .env.example                    # Variáveis de ambiente exemplo
└─ README.md                       # Este guia
```

---

## Executar Localmente

### Via Docker (Recomendado)

```bash
cd infra/Docker
docker compose up
```

Serviços iniciados:
- API Next.js: http://localhost:3000
- DynamoDB Local: http://localhost:8000
- Mock JWKS Server: http://localhost:8001

As tabelas DynamoDB são criadas automaticamente via script de migração.

### Via npm

```bash
npm install
cp .env.example .env
# Editar .env com suas credenciais
npm run dev
```

## Executar Migrações

### Desenvolvimento Local (DynamoDB Local)
Executado automaticamente ao rodar `docker compose up`.

### Produção (AWS)
```bash
cd infra/Terraform
terraform init
terraform apply
```

Cria as tabelas: Client, Owner, Pet, Appointment.

## Executar Testes

```bash
npm test              # Todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

Testes cobrem:
- CRUD DynamoDB
- Autenticação JWT + JWKS
- Autorização RBAC
- Endpoints da API
- Paginação

---

## Endpoints da API

Todas as rotas exigem autenticação via header `Authorization: Bearer <token>`.

### Owners

| Método | Endpoint | Autenticação | Descrição | Query Params |
|--------|----------|--------------|-----------|--------------|
| GET | `/api/owners` | requireAuth | Lista donos com paginação | `limit`, `offset` |
| POST | `/api/owners` | requireAuth | Cria dono | - |
| GET | `/api/owners/:id` | requireAuth | Busca dono por ID | - |
| PUT | `/api/owners/:id` | requireAuth | Atualiza dono | - |
| DELETE | `/api/owners/:id` | requireAuth | Remove dono | - |

### Pets

| Método | Endpoint | Autenticação | Descrição | Query Params |
|--------|----------|--------------|-----------|--------------|
| GET | `/api/pets` | requireAuth | Lista pets com paginação | `limit`, `offset`, `ownerId` |
| POST | `/api/pets` | requireAuth | Cria pet | - |
| GET | `/api/pets/:id` | requireAuth | Busca pet por ID | - |
| PUT | `/api/pets/:id` | requireAuth | Atualiza pet | - |
| DELETE | `/api/pets/:id` | requireAuth | Remove pet | - |

### Appointments

| Método | Endpoint | Autenticação | Descrição | Query Params |
|--------|----------|--------------|-----------|--------------|
| GET | `/api/appointments` | requireAuth | Lista compromissos | `limit`, `offset`, `petId`, `ownerId`, `date` |
| POST | `/api/appointments` | requireAuth | Cria compromisso | - |
| GET | `/api/appointments/:id` | requireAuth | Busca compromisso | - |
| PUT | `/api/appointments/:id` | requireAuth | Atualiza compromisso | - |
| DELETE | `/api/appointments/:id` | requireAuth | Remove compromisso | - |

### Users (Admin)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/users` | requireAdmin | Lista usuários |
| POST | `/api/users` | requireAdmin | Cria usuário |
| GET | `/api/users/:id` | requireSelfOrAdmin | Busca usuário |
| PUT | `/api/users/:id` | requireSelfOrAdmin | Atualiza usuário |
| DELETE | `/api/users/:id` | requireAdmin | Remove usuário |

### Paginação

Parâmetros suportados em listagens:
- `limit`: Número de itens por página (padrão: 10)
- `offset`: Deslocamento para paginação (padrão: 0)

Resposta paginada:
```json
{
  "items": [...],
  "total": 50,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

### Filtros

- **Pets**: `?ownerId=<uuid>` - Filtra pets por dono
- **Appointments**: 
  - `?petId=<uuid>` - Filtra por pet
  - `?ownerId=<uuid>` - Filtra por dono
  - `?date=YYYY-MM-DD` - Filtra por data

## Exemplos de Chamadas

### Criar Owner
```bash
curl -X POST http://localhost:3000/api/owners \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "address": "Rua A, 123"
  }'
```

### Listar Pets com Paginação
```bash
curl -X GET "http://localhost:3000/api/pets?limit=5&offset=0&ownerId=<owner-uuid>" \
  -H "Authorization: Bearer <token>"
```

### Criar Appointment
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "<pet-uuid>",
    "ownerId": "<owner-uuid>",
    "date": "2025-12-01",
    "time": "14:30",
    "type": "consulta",
    "status": "agendado",
    "veterinarian": "Dr. Maria",
    "notes": "Vacina anual"
  }'
```

## Usuários e Papéis

### Papéis
- **admin**: Acesso total ao sistema, pode gerenciar usuários
- **user**: Acesso autenticado às rotas de owners, pets e appointments

### Usuário de Teste (via Cognito)
```
Email: admin@example.com
Senha temporária: Admin123!
```

Obter token via Cognito:
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_SRP_AUTH \
  --client-id <client-id> \
  --auth-parameters USERNAME=admin@example.com,PASSWORD=Admin123!
```

---

## Autenticação e Autorização

### Fluxo de Autenticação
1. Cliente obtém JWT via AWS Cognito
2. JWT é enviado no header `Authorization: Bearer <token>`
3. API valida JWT via JWKS remoto (biblioteca jose)
4. Extrai claims (sub, scopes, roles) do payload
5. Middleware RBAC valida permissões

### Middlewares
- `requireAuth`: Valida apenas autenticação (token válido)
- `requireAdmin`: Exige role admin
- `requireSelfOrAdmin`: Permite acesso ao próprio recurso ou admin

### Respostas HTTP
- `200/201`: Sucesso
- `401`: Token ausente ou inválido
- `403`: Usuário sem permissão
- `404`: Recurso não encontrado
- `409`: Conflito (email duplicado, violação de integridade)
- `500`: Erro interno

## Estrutura de Pastas

```
.
├── .github/workflows/
│   └── ci.yml                    # Pipeline CI/CD
├── infra/
│   ├── Docker/
│   │   ├── docker-compose.yml    # Ambiente local
│   │   ├── Dockerfile
│   │   └── startDynamodb.sh      # Script de migração
│   └── Terraform/
│       ├── main.tf               # Recursos AWS
│       ├── variables.tf
│       └── terraform.tfvars
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── owners/
│   │   │   ├── pets/
│   │   │   ├── appointments/
│   │   │   └── users/
│   │   └── page.tsx
│   └── lib/
│       ├── auth/
│       │   ├── jwt.ts            # Verificação JWT
│       │   ├── rbac.ts           # Middlewares RBAC
│       │   ├── permissions.ts
│       │   └── withAuth.ts
│       ├── dynamodb.ts           # Service layer
│       └── swagger.ts            # OpenAPI spec
├── tests/
│   └── *.test.ts
└── docs/
    └── api-spec.yaml             # Documentação OpenAPI
```

## Infraestrutura AWS

Recursos provisionados via Terraform:

- **DynamoDB**: 4 tabelas (Client, Owner, Pet, Appointment)
- **Cognito**: User Pool + App Client + Resource Server
- **EC2**: Instância para deploy da API
- **S3**: Bucket para armazenamento
- **VPC**: Security groups e networking
- **ECR**: Registry para imagens Docker

```bash
cd infra/Terraform
terraform init
terraform plan
terraform apply
```

Outputs importantes:
- `user_pool_id`: ID do Cognito User Pool
- `jwt_issuer`: Issuer do JWT
- `jwks_uri`: URI do JWKS
- `ec2_public_ip`: IP público da instância

## CI/CD

Pipeline GitHub Actions executa em cada push/PR:

1. Checkout do código
2. Setup Node.js 20
3. Docker compose up (DynamoDB local)
4. npm install
5. Lint (ESLint)
6. Typecheck (tsc --noEmit)
7. Build (next build)
8. Testes (Jest)
9. Upload artifacts (coverage, OpenAPI docs)

## OpenAPI

Documentação acessível em:
- JSON: `docs/api-spec.json`
- YAML: `docs/api-spec.yaml`
- UI: `/api/docs` (Swagger UI)

Gerar documentação:
```bash
npm run docs:build
```

---

**Autores:** Ana Laura de Souza Lopes, Fernanda Farias Uberti