#!/bin/bash

echo "🔄 Atualizando aplicação (sem destruir infraestrutura)"

# 1. Build Docker no root
cd ../../
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_DEFAULT_REGION=$(aws configure get default.region)
REPO_URL="$ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cs2025af"

docker build -t cs2025af -f infra/Docker/Dockerfile .
aws ecr get-login-password --region $AWS_DEFAULT_REGION \
  | docker login --username AWS --password-stdin $REPO_URL

docker tag cs2025af:latest $REPO_URL:latest
docker push $REPO_URL:latest

echo "✅ Imagem atualizada no ECR"

# 2. Pegar IP da EC2
cd infra/Terraform
INSTANCE_IP=$(terraform output -raw instance_public_ip)

# 3. Reiniciar container remoto
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP <<EOF
  sudo docker stop \$(sudo docker ps -q) || true
  sudo docker pull $REPO_URL:latest
  sudo docker run -d -p 3000:3000 $REPO_URL:latest
  echo "✅ Container reiniciado na EC2!"
EOF
