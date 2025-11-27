variable "aws_region" {
  description = "AWS region para os recursos."
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Nome da key pair para acesso SSH à EC2."
  type        = string
}

variable "table_name" {
  description = "Nome da tabela DynamoDB para pets."
  type        = string
  default     = "Pet"
}

variable "owner_table_name" {
  description = "Nome da tabela DynamoDB para owners."
  type        = string
  default     = "Owner"
}

variable "appointment_table_name" {
  description = "Nome da tabela DynamoDB para appointments."
  type        = string
  default     = "Appointment"
}

variable "bucket_name" {
  description = "Nome do bucket S3."
  type        = string
}

variable "ecr_repo_name" {
  description = "Nome do repositório ECR."
  type        = string
  default     = "cs2025af"
}

variable "cognito_domain_prefix" {
  description = "Prefixo do domínio do Cognito Hosted UI (globalmente único)."
  type        = string
  default     = "meuspets-auth"
}

variable "cognito_callback_urls" {
  description = "Lista de callback URLs para o Cognito (Hosted UI)."
  type        = list(string)
  default     = [
    "http://localhost:3000/callback",
    "https://meuspets.com/callback"
  ]
}

variable "cognito_logout_urls" {
  description = "Lista de logout URLs para o Cognito (Hosted UI)."
  type        = list(string)
  default     = [
    "http://localhost:3000/logout",
    "https://meuspets.com/logout"
  ]
}

# Somente para popular o .env gerado localmente
variable "aws_access_key_id" {
  description = "AWS Access Key ID (usado apenas para gerar .env local)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key (usado apenas para gerar .env local)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_session_token" {
  description = "AWS Session Token (necessário para AWS Academy)"
  type        = string
  default     = ""
  sensitive   = true
}
