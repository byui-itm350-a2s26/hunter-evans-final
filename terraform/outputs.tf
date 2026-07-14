output "instance_id" {
  description = "ID of the EC2 instance."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = aws_instance.app.public_dns
}

output "application_url" {
  description = "URL where the running application can be reached."
  value       = "http://${aws_instance.app.public_dns}"
}
