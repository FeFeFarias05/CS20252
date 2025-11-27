# Guia de Deploy - MeusPets

## 📋 Visão Geral

O deploy da aplicação MeusPets segue um pipeline automático através do GitHub Actions que:

1. **Provisiona infraestrutura** na AWS (DynamoDB, Cognito, ECR, EC2)
2. **Compila e testa** o backend
3. **Constrói imagens Docker** e as envia para o ECR
4. **Faz pull no EC2** das novas imagens automaticamente

## 🏗️ Arquitetura

```
GitHub Repository
    ↓
GitHub Actions Pipeline
    ├─→ provision-infra (Terraform)
    ├─→ build-and-test (Backend)
    ├─→ build-and-push-docker (ECR)
    └─→ deploy-to-ec2 (opcional)
         ↓
AWS Infrastructure
    ├─→ ECR (Elastic Container Registry)
    ├─→ EC2 Instance (runs containers)
    ├─→ DynamoDB (Pets, Owners, Appointments)
    ├─→ Cognito (Authentication)
    └─→ API Gateway
         ↓
    meuspets.com (Domain)
```

## 🔧 Configuração Pré-Deploy

### 1. Variáveis de Ambiente no GitHub

Adicione os seguintes secrets no GitHub (Settings → Secrets):

```
AWS_ACCESS_KEY_ID=<sua_chave_de_acesso>
AWS_SECRET_ACCESS_KEY=<sua_chave_secreta>
AWS_SESSION_TOKEN=<seu_token_de_sessão> (opcional)
```

### 2. Arquivo de Configuração Terraform

Edite `/infra/Terraform/terraform.tfvars`:

```hcl
aws_region                     = "us-east-1"
ecr_repo_name                  = "cs20252-backend"
table_name                      = "Pet"
owner_table_name               = "Owner"
appointment_table_name         = "Appointment"
bucket_name                    = "cs20252-bucket"
cognito_domain_prefix          = "meuspets"
cognito_callback_urls          = ["https://meuspets.com/callback"]
cognito_logout_urls            = ["https://meuspets.com/logout"]
```

## 🚀 Processo de Deploy

### Opção 1: Deploy Automático (Recomendado)

1. Faça commit das mudanças na branch `main`
2. O GitHub Actions automaticamente:
   - Provisiona/atualiza infraestrutura
   - Constrói e testa o backend
   - Cria imagens Docker
   - Envia para ECR
   - EC2 faz pull e inicia novos containers

### Opção 2: Disparar Manualmente

```bash
# No GitHub: Actions → Backend - Deploy Completo → Run workflow
```

## 📦 Imagens Docker

### Backend
- ECR Repository: `cs20252-backend`
- Tags: `{commit-hash}`, `latest`
- Porta: 3001

### Frontend
- ECR Repository: `cs20252-frontend`
- Tags: `{commit-hash}`, `latest`
- Porta: 3000

## 🌐 API Gateway & Domínio

### Configurar o Domínio `meuspets.com`

1. **Registrar domínio** (Route53 ou registrador externo)
2. **Criar API Gateway na AWS**:
   - Resource: `/api/v1`
   - Integração: EC2 instance backend
   - Custom Domain: `meuspets.com`
3. **Configurar certificado SSL** (AWS Certificate Manager)

### URLs Disponíveis

- **Frontend**: `https://meuspets.com`
- **Backend API**: `https://meuspets.com/api/v1`
- **Swagger Docs**: `https://meuspets.com/api/v1/docs`
- **Health Check**: `https://meuspets.com/api/v1/health`

## 🔐 Segurança

### Variáveis de Ambiente no EC2

O Terraform automaticamente injeta:

```bash
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=Pet
DYNAMODB_OWNER_TABLE_NAME=Owner
DYNAMODB_APPOINTMENT_TABLE_NAME=Appointment
NODE_ENV=production
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/{pool-id}
JWT_AUDIENCE=https://api.cs20252
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/{pool-id}/.well-known/jwks.json
```

## 📊 Monitoramento

### CloudWatch Logs
```bash
aws logs tail /ecs/cs20252 --follow
```

### EC2 SSH
```bash
ssh -i "your-key.pem" ec2-user@<public-ip>
docker ps
docker logs <container-id>
```

## 🐛 Troubleshooting

### Erro: "ECR Login Failed"
- Verifique AWS credentials nos GitHub Secrets
- Confirme que a região está correta

### Erro: "DynamoDB Table not found"
- Verifique que o Terraform apply foi executado
- Confirme nomes das tabelas em `terraform.tfvars`

### Erro: "Cannot pull image from ECR"
- Verifique permissões IAM da instância EC2
- Confirme que a imagem foi enviada ao ECR

### Imagem não atualiza no EC2
- Forçar refresh manual:
  ```bash
  docker pull {registry}/{repo}:latest
  docker-compose down && docker-compose up -d
  ```

## 📝 Checklist de Deploy

- [ ] Secrets do AWS configurados no GitHub
- [ ] `terraform.tfvars` atualizado com valores corretos
- [ ] Testes passando localmente
- [ ] `.env.example` atualizado
- [ ] Swagger documentação revisada
- [ ] Frontend `.env.production` com URL correta
- [ ] Domínio `meuspets.com` apontando para API Gateway
- [ ] Certificado SSL configurado
- [ ] Health check respondendo

## 🔄 CI/CD Pipeline

### Workflows Disponíveis

1. **`backend-deploy.yml`** - Deploy completo do backend
2. **`deploy.yml`** - Deploy rápido de frontend + backend
3. **`ci.yml`** - Testes e validação

### Triggers

- **main branch push**: Executa deploy automático
- **PR**: Executa testes
- **Manual**: Via GitHub Actions UI

## 📚 Referências

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ECR Best Practices](https://docs.aws.amazon.com/AmazonECR/latest/userguide/)
- [API Gateway Setup](https://docs.aws.amazon.com/apigateway/latest/developerguide/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/)
