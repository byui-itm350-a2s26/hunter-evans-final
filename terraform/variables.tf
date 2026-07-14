variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name/tag applied to the created resources."
  type        = string
  default     = "hunter-evans-final"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.micro"
}

variable "docker_image" {
  description = "Docker image (with tag) to pull and run on the instance."
  type        = string
  default     = "hunterevans0/hunter-evnas-final:latest"
}
