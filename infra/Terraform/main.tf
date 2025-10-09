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

  # Regra para DynamoDB Admin (opcional)
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

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)

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

# Roda o container
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
