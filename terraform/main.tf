terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Look up the latest Amazon Linux 2023 AMI so we never hard-code an AMI id.
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# Use the account's default VPC to keep the footprint minimal.
data "aws_vpc" "default" {
  default = true
}

# Security group: allow inbound HTTP (port 80) from anywhere so the app is
# reachable, plus SSH for debugging. All outbound traffic is allowed.
resource "aws_security_group" "app_sg" {
  name        = "${var.app_name}-sg"
  description = "Allow HTTP and SSH for the Campus Events Calendar app"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
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

  tags = {
    Name    = "${var.app_name}-sg"
    Project = var.app_name
  }
}

# The EC2 instance. user_data installs Docker, then pulls and runs the image,
# mapping host port 80 to the container's port 8080.
resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail
    dnf update -y
    dnf install -y docker
    systemctl enable --now docker

    # Pull and run the application container, restarting on reboot/failure.
    docker pull ${var.docker_image}
    docker run -d --restart always \
      --name campus-events \
      -p 80:8080 \
      ${var.docker_image}
  EOF

  user_data_replace_on_change = true

  tags = {
    Name    = var.app_name
    Project = var.app_name
  }
}
