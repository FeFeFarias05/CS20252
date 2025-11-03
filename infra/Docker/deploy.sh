#!/bin/bash

echo "🚀 Iniciando deploy automático (Docker + ECR + Terraform)..."

############################
# 1️⃣ Configurar credenciais AWS
############################
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Session Token: " AWS_SESSION_TOKEN
read -p "Região AWS (ex: us-east-1): " AWS_DEFAULT_REGION

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set aws_session_token $AWS_SESSION_TOKEN
aws configure set default.region $AWS_DEFAULT_REGION

############################
# 2️⃣ Definir variáveis
############################
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_URL="$ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cs2025af"
echo "✅ Conta AWS: $ACCOUNT_ID"
echo "✅ ECR: $REPO_URL"

############################
# 3️⃣ Ir para a raiz do projeto (onde está package.json)
############################
cd ../../  # sobe de infra/docker → para CS20252
echo "📁 Diretório atual (raiz do projeto): $(pwd)"

############################
# 4️⃣ Build da imagem usando Dockerfile em infra/docker
############################
docker build -t cs2025af -f infra/docker/Dockerfile .

# Login, tag e push
aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REPO_URL
docker tag cs2025af:latest $REPO_URL:latest
docker push $REPO_URL:latest

############################
# 5️⃣ Terraform apply
############################
cd infra/Terraform
terraform init
terraform apply -auto-approve

echo "✅ Deploy concluído!"
