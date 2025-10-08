<<<<<<< Updated upstream
# ================== Provider ==================
provider "aws" {
  region = "us-east-1"
}

# ================== VPC Default ==================
=======
# ================= VPC DEFAULT =================
>>>>>>> Stashed changes
data "aws_vpc" "default" {
  default = true
}

<<<<<<< Updated upstream
# ================== Security Group ==================
=======
# ================= SECURITY GROUP =================
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Nova regra para DynamoDB Admin
  ingress {
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
# ================== Data Source AMI ==================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)
=======

# ================= DATA SOURCE AMI =================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
>>>>>>> Stashed changes

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

<<<<<<< Updated upstream
# ================== EC2 Instance ==================
resource "aws_instance" "app_instance" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.allow_http.id]

  iam_instance_profile   = "LabInstanceProfile"
=======
# ================= INSTÂNCIA EC2 =================
resource "aws_instance" "app_instance" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t2.micro"
  key_name             = var.key_name
  security_groups      = [aws_security_group.allow_http.name]
  iam_instance_profile = "LabInstanceProfile" # LabRole do AWS Academy
>>>>>>> Stashed changes

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Atualiza pacotes e instala Docker
    sudo apt update -y
<<<<<<< Updated upstream
    sudo apt install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo docker pull fernetest/cs20252:latest
    sudo docker run -d -p 3000:3000 fernetest/cs20252:latest
=======
    sudo apt install docker.io -y
    sudo systemctl start docker
    sudo systemctl enable docker

    # Roda o container da aplicação
    sudo docker run -d -p 3000:3000 \
      -e AWS_REGION=${var.aws_region} \
      -e DYNAMODB_TABLE_NAME=Client \
      --name cs20252-app \
      cs20252:latest
>>>>>>> Stashed changes
  EOF

  tags = {
    Name = "cs20252AF"
  }
}

<<<<<<< Updated upstream
# ================== DynamoDB Table ==================
=======
# ================= DYNAMODB =================
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
# ================== S3 Bucket ==================
=======
# ================= S3 BUCKET =================
>>>>>>> Stashed changes
resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name

  tags = {
    Name = var.bucket_name
  }
}

output "ec2_public_ip" {
  value = aws_instance.app_instance.public_ip
}

output "ec2_public_dns" {
  value = aws_instance.app_instance.public_dns
}
