#!/bin/bash

echo "🚀 Deploy inicial (infraestrutura + Docker + ECR + Terraform)"

# 1. Credenciais AWS Academy
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Session Token: " AWS_SESSION_TOKEN
read -p "Região AWS (ex: us-east-1): " AWS_DEFAULT_REGION

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set aws_session_token $AWS_SESSION_TOKEN
aws configure set default.region $AWS_DEFAULT_REGION

# 2. Definir variáveis
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_URL="$ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cs2025af"

cd ../../

# 3. Build Docker
docker build -t cs2025af -f infra/docker/Dockerfile .
aws ecr get-login-password --region $AWS_DEFAULT_REGION \
  | docker login --username AWS --password-stdin $REPO_URL

docker tag cs2025af:latest $REPO_URL:latest
docker push $REPO_URL:latest

# 4. Terraform init + apply
cd infra/Terraform
terraform init -upgrade
terraform apply -auto-approve

echo "✅ Infra criada com sucesso!"
