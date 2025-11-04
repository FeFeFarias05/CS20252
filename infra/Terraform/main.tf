# CS20252 - Infraestrutura AWS com Cognito
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.7.0"
}

provider "aws" {
  region = var.aws_region
}

# REDE E SEGURANÇA

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "allow_http" {
  name        = "allow_http"
  description = "Allow HTTP traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_http"
  }
}

# EC2 INSTANCE - Servidor da Aplicação

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

resource "aws_instance" "app_instance" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.allow_http.id]
  iam_instance_profile   = "LabInstanceProfile"

  user_data = <<-EOF
#!/bin/bash
set -e

sudo apt update -y
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

sudo docker pull fernetest/cs20252:latest

sudo docker run -d -p 3000:3000 \
  -e AWS_REGION=${var.aws_region} \
  -e DYNAMODB_TABLE_NAME=${var.table_name} \
  -e NODE_ENV=production \
  fernetest/cs20252:latest
EOF

  tags = {
    Name = "cs20252AF"
  }
}

# DYNAMODB E S3

resource "aws_dynamodb_table" "client_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "clientId"

  attribute {
    name = "clientId"
    type = "S"
  }

  tags = {
    Name = var.table_name
  }
}

resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name

  tags = {
    Name = var.bucket_name
  }
}

resource "aws_s3_bucket" "example_second_bucket" {
  bucket = var.second_bucket_name

  tags = {
    Name = var.second_bucket_name
  }
}

# COGNITO - AUTENTICAÇÃO E AUTORIZAÇÃO

# USER POOL
resource "aws_cognito_user_pool" "users" {
  name = "cs20252-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  auto_verified_attributes = ["email"]

  tags = {
    Name = "cs20252-user-pool"
  }
}

# RESOURCE SERVER
resource "aws_cognito_resource_server" "api" {
  identifier   = "https://api.cs20252"
  name         = "CS20252 API"
  user_pool_id = aws_cognito_user_pool.users.id

  scope {
    scope_name        = "read"
    scope_description = "Permissão de leitura"
  }

  scope {
    scope_name        = "write"
    scope_description = "Permissão de escrita"
  }
}

# APP CLIENT
resource "aws_cognito_user_pool_client" "app_client" {
  name         = "cs20252-app-client"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                   = ["code"]

  allowed_oauth_scopes = [
    "openid",
    "email",
    "profile",
    "aws.cognito.signin.user.admin",
    "${aws_cognito_resource_server.api.identifier}/read",
    "${aws_cognito_resource_server.api.identifier}/write"
  ]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]

  callback_urls = [
    "http://localhost:3000/callback",
    "https://meuapp.com/callback"
  ]

  logout_urls = [
    "http://localhost:3000/logout",
    "https://meuapp.com/logout"
  ]
}

# USER POOL DOMAIN (para Hosted UI)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "cs20252-auth"
  user_pool_id = aws_cognito_user_pool.users.id
}

# ADMIN USER
resource "aws_cognito_user" "admin_user" {
  user_pool_id       = aws_cognito_user_pool.users.id
  username           = "admin@example.com"
  temporary_password = "Admin123!"
  attributes = {
    email          = "admin@example.com"
    email_verified = true
  }
}

# LOCALS PARA .env
locals {
  jwt_issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}"
  jwt_audience = aws_cognito_resource_server.api.identifier
  jwks_uri     = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}/.well-known/jwks.json"
}

# ARQUIVO .env AUTOMÁTICO
resource "local_file" "env_file" {
  filename = "${path.module}/.env"
  content  = templatefile("${path.module}/env.tpl", {
    aws_region            = var.aws_region
    aws_access_key_id     = var.aws_access_key_id
    aws_secret_access_key = var.aws_secret_access_key
    dynamodb_table_name   = var.table_name
    jwt_issuer            = local.jwt_issuer
    jwt_audience          = local.jwt_audience
    jwks_uri              = local.jwks_uri
  })
}

# OUTPUTS
output "ec2_public_ip" {
  value = aws_instance.app_instance.public_ip
}

output "ec2_public_dns" {
  value = aws_instance.app_instance.public_dns
}

output "user_pool_id" {
  value = aws_cognito_user_pool.users.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.app_client.id
}

output "jwt_issuer" {
  value = local.jwt_issuer
}

output "jwks_uri" {
  value = local.jwks_uri
}

output "jwt_audience" {
  value = local.jwt_audience
}
