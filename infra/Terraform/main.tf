
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

  tags = { Name = "allow_http" }
}


resource "aws_ecr_repository" "repository" {
  name         = var.ecr_repo_name
  force_delete = true
}


data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

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
  iam_instance_profile   = "LabInstanceProfile" # mantém como na 1ª versão

  user_data = <<-EOF
    #!/bin/bash
    set -e

    apt update -y
    apt install -y docker.io
    systemctl enable docker
    systemctl start docker

    docker pull fernetest/cs20252:latest

    # Sobe o container
    docker run -d -p 3000:3000 \
      -e AWS_REGION=${var.aws_region} \
      -e DYNAMODB_TABLE_NAME=${var.table_name} \
      -e NODE_ENV=production \
      fernetest/cs20252:latest
  EOF

  tags = { Name = "cs20252AF" }
}


resource "aws_dynamodb_table" "client_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "clientId"

  attribute {
    name = "clientId"
    type = "S"
  }

  tags = { Name = var.table_name }
}

resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name

  tags = { Name = var.bucket_name }
}


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

  tags = { Name = "cs20252-user-pool" }
}

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

resource "aws_cognito_user_pool_client" "app_client" {
  name         = "cs20252-app-client"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]

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

  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.users.id
}

resource "aws_cognito_user" "admin_user" {
  user_pool_id       = aws_cognito_user_pool.users.id
  username           = "admin@example.com"
  temporary_password = "Admin123!"
  attributes = {
    email          = "admin@example.com"
    email_verified = true
  }
}



locals {
  jwt_issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}"
  jwt_audience = aws_cognito_resource_server.api.identifier
  jwks_uri     = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}/.well-known/jwks.json"
}

resource "local_file" "env_file" {
  filename = "${path.module}/.env"
content = <<EOF
AWS_REGION=${var.aws_region}
AWS_ACCESS_KEY_ID=${var.aws_access_key_id}
AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}
DYNAMODB_TABLE_NAME=${var.table_name}
JWT_ISSUER=${local.jwt_issuer}
JWT_AUDIENCE=${local.jwt_audience}
JWKS_URI=${local.jwks_uri}
EOF

}


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

output "cognito_login_url" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.app_client.id}&response_type=code&scope=openid&redirect_uri=${var.cognito_callback_urls[0]}"
}
