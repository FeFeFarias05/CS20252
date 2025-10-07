
# ================= VPC Default =================
data "aws_vpc" "default" {
  default = true
}

# ================= Security Group =================
resource "aws_security_group" "allow_http" {
  name        = "allow_http"
  description = "Allow HTTP traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 8080
    to_port     = 8080
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
  owners      = ["099720109477"] # Canonical

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
    sudo apt install docker.io -y
    sudo systemctl start docker
    sudo docker run -d -p 8080:8080 nome-da-sua-imagem
  EOF

  tags = {
    Name = "cs20252AF"
  }
}

# ================= DynamoDB =================
resource "aws_dynamodb_table" "example_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "name"
  range_key = "date"

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "date"
    type = "N"
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
