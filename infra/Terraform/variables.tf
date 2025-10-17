variable "aws_region" {
  default = "us-east-1"
}

variable "key_name" {
  description = "Nome do par de chaves EC2"
  type        = string
}

variable "bucket_name" {
  description = "Nome do bucket S3"
  type        = string
}


variable "second_bucket_name" {
  description = "Nome do bucket S3"
  type        = string
}

variable "table_name" {
  description = "Nome da tabela DynamoDB"
  type        = string
}
