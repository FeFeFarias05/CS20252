# ================== Provider ==================
provider "aws" {
  region = "us-east-1"
}

# ================== VPC Default ==================
data "aws_vpc" "default" {
  default = true
}

# ================== Security Group ==================
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ================== Data Source AMI ==================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

# ================== EC2 Instance ==================
resource "aws_instance" "app_instance" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.allow_http.id]

  iam_instance_profile   = "LabInstanceProfile"

  user_data = <<-EOF
    #!/bin/bash
    sudo apt update -y
    sudo apt install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo docker pull fernetest/cs20252:latest
    sudo docker run -d -p 3000:3000 fernetest/cs20252:latest
  EOF

  tags = {
    Name = "cs20252AF"
  }
}

# ================== DynamoDB Table ==================
resource "aws_dynamodb_table" "client_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "clientId"
  attribute {
    name = "clientId"
    type = "S"
  }

  tags = {
    Name = var.table_name
  }
}

# ================== S3 Bucket ==================
resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name

  tags = {
    Name = var.bucket_name
  }
}
