# Sprint 0 – Setup de Time, Stack e Projeto

Este repositório implementa a Sprint 0 e Sprint 1 de uma aplicação base utilizando **Next.js**, **TypeScript** e **AWS DynamoDB**.  
O objetivo é prover uma estrutura mínima e segura, com autenticação JWT baseada em JWKS remoto, autorização RBAC (Role-Based Access Control), testes automatizados e infraestrutura definida como código via **Terraform**.

---

## 🔧 Stack

- **Linguagem:** TypeScript  
- **Framework:** React com Next.js (App Router)  
- **Banco:** AWS DynamoDB (via SDK Document Client)  
- **Autenticação:** JWT (biblioteca `jose`, JWKS remoto)  
- **Infraestrutura:** Terraform (Cognito, DynamoDB, EC2, S3, VPC)  
- **Testes:** Jest + Supertest  
- **CI/CD:** GitHub Actions  

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

## 🚀 Como Executar

Você pode rodar o projeto de duas formas: via **Docker** (recomendado) ou **localmente**.

### Rodando com Docker

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme seu ambiente (principalmente as de JWT e AWS):

```
JWKS_URI=http://localhost:8001/.well-known/jwks.json
JWT_ISSUER=http://test-issuer
JWT_AUDIENCE=test-aud
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
DYNAMODB_TABLE=clients
```

2. Suba os containers:

```bash
docker compose up -d
```

Isso iniciará o app Next.js e um DynamoDB local.  
A aplicação ficará disponível em **http://localhost:3000**.

---

### Rodando localmente

1. Instale as dependências:

```bash
npm install
```

2. Ajuste as variáveis `.env` conforme acima.

3. Inicie o servidor:

```bash
npm run dev
```

4. O servidor ficará disponível em **http://localhost:3000**.

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
curl -X POST http://localhost:3000/api/users   -H "Authorization: Bearer <token-admin>"   -H "Content-Type: application/json"   -d '{"name":"Maria","email":"maria@example.com"}'
```

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

Os testes utilizam **Jest** e **Supertest**, cobrindo:

| Arquivo | Escopo |
|----------|--------|
| `dynamodb.test.ts` | CRUD DynamoDB |
| `api.test.ts` | Endpoints + RBAC |
| `auth.test.ts` | Middleware JWT |
| `user.auth.test.ts` | Integração JWT + JWKS mock |

Para executar:

```bash
npm test
```

Os testes de integração utilizam um servidor JWKS mock (`tests/jwks-mock.ts`) e um DynamoDB local.

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

---

💡 **Grupo:**  
Ana Laura de Souza Lopes e Fernanda Farias Uberti