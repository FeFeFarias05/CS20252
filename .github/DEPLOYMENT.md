# 🚀 Guia de Deploy Backend - CS20252

## Workflow: Backend Deploy Completo

O workflow `.github/workflows/backend-deploy.yml` realiza 4 jobs sequenciais:

### 1️⃣ Provisionar Infraestrutura (Terraform)
- Inicializa e valida configuração Terraform
- Cria/atualiza recursos AWS:
  - 3 Tabelas DynamoDB (Pet, Owner, Appointment)
  - Cognito User Pool
  - ECR Repository (`cs2025af`)
  - EC2 Instance (t2.micro)
  - VPC, Security Groups, S3

### 2️⃣ Build e Test
- Instala dependências (`npm ci`)
- Lint TypeScript (`npm run lint`)
- Executa testes (`npm test`)
- Compila TypeScript (`npm run build`)

### 3️⃣ Build e Push Docker
- Faz login no ECR
- Build da imagem Docker do backend
- Push com tags: `<SHA>` e `latest`

### 4️⃣ Deploy EC2 (Manual)
- **Só executa se workflow for manual** (`workflow_dispatch`)
- Reinicia instância EC2 para aplicar nova imagem

---

## 🔑 GitHub Secrets Necessários

Configure estes secrets em **Settings → Secrets and variables → Actions**:

### AWS Academy Learner Lab

```bash
AWS_ACCESS_KEY_ID          # Access Key da sessão AWS Academy
AWS_SECRET_ACCESS_KEY      # Secret Access Key da sessão
AWS_SESSION_TOKEN          # Session Token (⚠️ expira em algumas horas)
```

#### Como obter as credenciais:

1. Acesse AWS Academy Learner Lab
2. Clique em **AWS Details**
3. Clique em **Show** ao lado de "AWS CLI"
4. Copie os valores:
   ```bash
   aws_access_key_id=ASIAWFHOX2PPYI2V4ZRD
   aws_secret_access_key=PlKao/JqV/...
   aws_session_token=IQoJb3Jp...
   ```

#### ⚠️ IMPORTANTE:
- **Session Token expira** quando você para a sessão do Learner Lab
- **Atualize os secrets no GitHub** antes de cada deploy
- Se o workflow falhar com erro de autenticação, verifique se a sessão está ativa

---

## 🎯 Quando o Workflow é Executado

### Automaticamente:
- Push para branch `main` que modifique:
  - `backend/**`
  - `infra/Terraform/**`
  - `.github/workflows/backend-deploy.yml`

### Manualmente:
- Acesse **Actions → Backend - Deploy Completo → Run workflow**
- Selecione a branch `main`
- Clique em **Run workflow**

---

## 📋 Checklist Antes do Deploy

- [ ] Sessão AWS Academy Learner Lab está **ativa** (luz verde)
- [ ] GitHub Secrets estão **atualizados** com credenciais da sessão atual
- [ ] Código passou nos testes localmente: `cd backend && npm test`
- [ ] Terraform válido: `cd infra/Terraform && terraform validate`
- [ ] Variáveis Terraform configuradas em `terraform.tfvars`

---

## 🔍 Verificar Deploy

### 1. Acompanhar Workflow
- Acesse **Actions** no GitHub
- Veja logs de cada job em tempo real
- Resumo aparece ao final com informações da imagem

### 2. Verificar Infraestrutura
```bash
# DynamoDB Tables
aws dynamodb list-tables

# ECR Images
aws ecr describe-images --repository-name cs2025af

# EC2 Instance
aws ec2 describe-instances --filters "Name=tag:Name,Values=cs20252AF"
```

### 3. Testar API (após EC2 iniciar)
```bash
# Obter IP público da instância
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=cs20252AF" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Testar health check
curl http://$INSTANCE_IP:3001/health

# Testar API
curl http://$INSTANCE_IP:3001/api/v1/pets
```

---

## 🛠️ Troubleshooting

### Erro: "Error configuring AWS credentials"
- **Causa:** Session token expirado
- **Solução:** Atualize secrets no GitHub com nova sessão AWS Academy

### Erro: "No changes. Infrastructure is up-to-date"
- **Normal:** Terraform não detectou alterações
- Workflow continua para build/push da imagem

### Erro: "Error building Docker image"
- Verifique `backend/Dockerfile`
- Teste local: `cd backend && docker build -t test .`

### Erro: "Instance not found" no deploy EC2
- **Causa:** EC2 pode não existir ainda ou tag incorreta
- **Solução:** Verificar no console AWS ou aguardar Terraform criar

### Imagem não atualiza no EC2
- EC2 user_data roda apenas no **primeiro boot**
- Para forçar atualização: execute job 4 (workflow manual) ou:
  ```bash
  # SSH na instância e execute:
  docker pull <ECR_REGISTRY>/cs2025af:latest
  docker stop <container_id>
  docker run -d -p 3001:3001 <ECR_REGISTRY>/cs2025af:latest
  ```

---

## 📊 Estrutura do Projeto

```
CS20252/
├── backend/                    # Código do backend
│   ├── Dockerfile             # Imagem Docker
│   ├── package.json
│   └── src/
├── infra/
│   └── Terraform/             # ⚠️ Caminho correto (não infra/ direto)
│       ├── main.tf            # Recursos AWS
│       ├── variables.tf
│       └── terraform.tfvars   # Valores das variáveis
└── .github/
    └── workflows/
        ├── backend-deploy.yml  # ✅ Workflow completo
        └── deploy.yml         # Workflow antigo (frontend+backend)
```

---

## 🎓 Próximos Passos

1. **Primeira execução:** Execute workflow manualmente para provisionar tudo
2. **Desenvolvimento:** Faça push para `main` - deploy automático
3. **Monitoramento:** Configure CloudWatch Logs (opcional)
4. **Domain:** Configure Route53 + ALB para domínio customizado (opcional)
5. **HTTPS:** Configure ACM + ALB para SSL (opcional)

---

## 📚 Recursos

- [AWS Academy Learner Lab](https://awsacademy.instructure.com)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker ECR Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
