#!/bin/bash
echo "Configurando credenciais temporárias da AWS Academy..."

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Session Token: " AWS_SESSION_TOKEN
read -p "Região (ex: us-east-1): " AWS_DEFAULT_REGION

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set aws_session_token $AWS_SESSION_TOKEN
aws configure set default.region $AWS_DEFAULT_REGION

echo "Credenciais configuradas com sucesso!"
