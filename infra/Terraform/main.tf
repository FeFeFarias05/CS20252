# ================= VPC Default =================
data "aws_vpc" "default" {
  default = true
}

# ================= Security Group =================
resource "aws_security_group" "allow_http" {
  name        = "allow_http"
  description = "Allow HTTP and SSH traffic"
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ================= Data Source AMI =================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu official)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

# ================= Instância EC2 =================
resource "aws_instance" "app_instance" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name      = var.key_name
  security_groups = [aws_security_group.allow_http.name]

  user_data = <<-EOF
    #!/bin/bash
    sudo apt update -y
    sudo apt install docker.io awscli -y
    sudo systemctl start docker
    sudo systemctl enable docker

    echo "EC2 pronta! Faça login manualmente no ECR e rode o container."
  EOF

  tags = {
    Name = "cs20252AF"
  }
}

# ================= ECR Repository =================
resource "aws_ecr_repository" "app_repository" {
  name                 = "cs20252-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "cs20252-app"
  }
}

# ================= DynamoDB =================
resource "aws_dynamodb_table" "example_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = var.table_name
  }
}

# ================= Bucket S3 =================
resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name

  tags = {
    Name = var.bucket_name
  }
}
