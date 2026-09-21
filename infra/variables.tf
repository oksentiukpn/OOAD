variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name used for resource naming"
  type        = string
  default     = "meeting-app"
}

variable "environment" {
  description = "Environment identifier (e.g. production, staging, dev)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (used by ALB and Fargate tasks)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "db_subnet_cidrs" {
  description = "CIDR blocks for RDS DB subnets (spans 2 AZs for RDS Subnet Group)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "db_name" {
  description = "RDS PostgreSQL database name"
  type        = string
  default     = "meetings_db"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "RDS master password (minimum 8 characters, avoiding @ or /)"
  type        = string
  sensitive   = true
  default     = "Postgres_Secure_2026!"
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16.10"
}

variable "db_instance_class" {
  description = "RDS PostgreSQL instance type (AWS Free Tier: db.t3.micro or db.t4g.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "fargate_cpu" {
  description = "Fargate CPU units (256 = 0.25 vCPU - lowest tier for cost savings)"
  type        = string
  default     = "256"
}

variable "fargate_memory" {
  description = "Fargate RAM in MiB (512 MiB - lowest tier for 256 CPU)"
  type        = string
  default     = "512"
}

variable "backend_image" {
  description = "Custom image URI for backend (if empty, defaults to the deployed ECR repo:latest)"
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Custom image URI for frontend (if empty, defaults to the deployed ECR repo:latest)"
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Allowed CORS origins for the FastAPI backend"
  type        = list(string)
  default     = ["*", "https://1233.pp.ua", "http://1233.pp.ua"]
}
