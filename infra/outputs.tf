output "alb_dns_name" {
  description = "Application Load Balancer DNS name (Target for Cloudflare CNAME)"
  value       = aws_lb.main.dns_name
}

output "cloudflare_cname_target" {
  description = "Add a CNAME record in Cloudflare pointing 1233.pp.ua to this value"
  value       = aws_lb.main.dns_name
}

output "site_url" {
  description = "Public website URL once Cloudflare CNAME is configured"
  value       = "https://1233.pp.ua"
}

output "alb_url" {
  description = "Direct ALB URL (Frontend SPA)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "backend_api_url" {
  description = "Backend API base URL"
  value       = "http://${aws_lb.main.dns_name}/api/v1"
}

output "backend_health_url" {
  description = "Backend health check endpoint"
  value       = "http://${aws_lb.main.dns_name}/health"
}

output "ecr_backend_repository_url" {
  description = "Amazon ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "Amazon ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL hostname"
  value       = aws_db_instance.postgres.address
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}
