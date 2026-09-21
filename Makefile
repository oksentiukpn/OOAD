# ==============================================================================
# Makefile: Meeting Management System (Local Compose & AWS Fargate + RDS)
# ==============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

# ------------------------------------------------------------------------------
# Load Environment Variables from .env file if it exists
# ------------------------------------------------------------------------------
ENV_FILE ?= .env

ifneq ($(wildcard $(ENV_FILE)),)
    include $(ENV_FILE)
    export $(shell sed -e 's/=.*//' -e 's/^[[:space:]]*//' -e '/^#/d' -e '/^$$/d' $(ENV_FILE))
endif

# AWS Region fallback & ensure Terraform receives the target region
AWS_REGION ?= us-east-1
export AWS_DEFAULT_REGION ?= $(AWS_REGION)
export AWS_REGION ?= $(AWS_REGION)
export TF_VAR_aws_region := $(AWS_REGION)

# Directory variables
INFRA_DIR    := infra
BACKEND_DIR  := back
FRONTEND_DIR := front
DOCKER_COMPOSE := docker compose

# ------------------------------------------------------------------------------
# Help Target
# ------------------------------------------------------------------------------
.PHONY: help
help:
	@echo "================================================================================"
	@echo " Meeting Management System - Available Commands"
	@echo "================================================================================"
	@echo ""
	@echo " [Local Docker Compose Commands]"
	@echo "   make up              - Start local services (DB, backend, frontend) in background"
	@echo "   make down            - Stop and remove local containers"
	@echo "   make build           - Build or rebuild local Docker images"
	@echo "   make restart         - Restart local services"
	@echo "   make logs            - Follow local logs across all services"
	@echo "   make ps              - View status of local running containers"
	@echo "   make clean           - Stop containers and remove volumes (database reset)"
	@echo ""
	@echo " [AWS Infrastructure (Terraform Free Tier)]"
	@echo "   make infra-init      - Initialize Terraform in $(INFRA_DIR)/"
	@echo "   make infra-plan      - Show Terraform execution plan"
	@echo "   make infra-apply     - Apply Terraform changes to AWS"
	@echo "   make infra-destroy   - Destroy AWS infrastructure"
	@echo "   make infra-output    - Print deployed AWS endpoints and outputs"
	@echo ""
	@echo " [AWS Deployment (Full Stack: Frontend + Backend + RDS)]"
	@echo "   make deploy          - End-to-end deploy: build & push images, apply RDS & Fargate"
	@echo "   make ecr-login       - Authenticate Docker with Amazon ECR"
	@echo "   make build-backend   - Build backend Docker image for linux/amd64"
	@echo "   make push-backend    - Build and push backend image to Amazon ECR"
	@echo "   make build-frontend  - Build frontend React Docker image for linux/amd64"
	@echo "   make push-frontend   - Build and push frontend image to Amazon ECR"
	@echo "   make build-all       - Build both backend and frontend images"
	@echo "   make push-all        - Push both backend and frontend images"
	@echo "   make ecs-deploy      - Trigger rolling update on AWS ECS Fargate service"
	@echo "   make status          - Check health of deployed website and API"
	@echo ""
	@echo "================================================================================"

# ------------------------------------------------------------------------------
# Local Docker Compose Commands
# ------------------------------------------------------------------------------
.PHONY: up compose-up
up: compose-up
compose-up:
	@echo "Starting local services with Docker Compose..."
	$(DOCKER_COMPOSE) up -d

.PHONY: down compose-down
down: compose-down
compose-down:
	@echo "Stopping local services..."
	$(DOCKER_COMPOSE) down

.PHONY: build compose-build
build: compose-build
compose-build:
	@echo "Building Docker Compose images..."
	$(DOCKER_COMPOSE) build

.PHONY: restart compose-restart
restart: compose-restart
compose-restart:
	@echo "Restarting Docker Compose services..."
	$(DOCKER_COMPOSE) restart

.PHONY: logs compose-logs
logs: compose-logs
compose-logs:
	$(DOCKER_COMPOSE) logs -f

.PHONY: ps compose-ps
ps: compose-ps
compose-ps:
	$(DOCKER_COMPOSE) ps

.PHONY: clean compose-clean
clean: compose-clean
compose-clean:
	@echo "Stopping containers and wiping volumes..."
	$(DOCKER_COMPOSE) down -v --remove-orphans

# ------------------------------------------------------------------------------
# AWS Credentials Validation
# ------------------------------------------------------------------------------
.PHONY: check-aws
check-aws:
	@if [ -z "$$AWS_ACCESS_KEY_ID" ] || [ -z "$$AWS_SECRET_ACCESS_KEY" ]; then \
		echo "================================================================================"; \
		echo " [ERROR] Missing AWS credentials in $(ENV_FILE)!"; \
		echo " Please set the following in your $(ENV_FILE) file:"; \
		echo "   AWS_ACCESS_KEY_ID=your_access_key_id"; \
		echo "   AWS_SECRET_ACCESS_KEY=your_secret_access_key"; \
		echo "   AWS_REGION=$(AWS_REGION)"; \
		echo "================================================================================"; \
		exit 1; \
	fi

# ------------------------------------------------------------------------------
# AWS Infrastructure (Terraform)
# ------------------------------------------------------------------------------
.PHONY: infra-init
infra-init:
	@echo "Initializing Terraform..."
	terraform -chdir=$(INFRA_DIR) init

.PHONY: infra-plan
infra-plan: check-aws
	@echo "Planning Terraform changes in $(AWS_REGION)..."
	terraform -chdir=$(INFRA_DIR) plan

.PHONY: infra-apply
infra-apply: check-aws
	@echo "Applying Terraform changes in $(AWS_REGION)..."
	terraform -chdir=$(INFRA_DIR) apply -auto-approve

.PHONY: infra-destroy
infra-destroy: check-aws
	@echo "Destroying AWS resources in $(AWS_REGION)..."
	terraform -chdir=$(INFRA_DIR) destroy -auto-approve

.PHONY: infra-output
infra-output:
	@terraform -chdir=$(INFRA_DIR) output

# ------------------------------------------------------------------------------
# AWS Deployment Workflow
# ------------------------------------------------------------------------------
.PHONY: ecr-login
ecr-login: check-aws
	@echo "Authenticating Docker with Amazon ECR..."
	@ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_backend_repository_url 2>/dev/null || terraform -chdir=$(INFRA_DIR) output -raw ecr_repository_url 2>/dev/null); \
	if [ -z "$$ECR_URL" ]; then \
		echo "ECR Repositories not yet found. Initializing and provisioning ECR in $(AWS_REGION)..."; \
		terraform -chdir=$(INFRA_DIR) init -input=false; \
		terraform -chdir=$(INFRA_DIR) apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend -target=aws_ecr_lifecycle_policy.backend -target=aws_ecr_lifecycle_policy.frontend -auto-approve; \
		ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_backend_repository_url 2>/dev/null || terraform -chdir=$(INFRA_DIR) output -raw ecr_repository_url); \
	fi; \
	REGISTRY=$$(echo $$ECR_URL | cut -d'/' -f1); \
	REGISTRY_REGION=$$(echo $$REGISTRY | cut -d'.' -f4); \
	echo "Logging into ECR registry: $$REGISTRY in region: $$REGISTRY_REGION"; \
	aws ecr get-login-password --region $$REGISTRY_REGION | docker login --username AWS --password-stdin $$REGISTRY

.PHONY: build-backend
build-backend:
	@echo "Building backend container for linux/amd64..."
	@ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_backend_repository_url 2>/dev/null || terraform -chdir=$(INFRA_DIR) output -raw ecr_repository_url 2>/dev/null || echo "meeting-backend"); \
	docker build --platform linux/amd64 -t $$ECR_URL:latest $(BACKEND_DIR)

.PHONY: push-backend
push-backend: check-aws ecr-login build-backend
	@echo "Pushing backend container image to Amazon ECR..."
	@ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_backend_repository_url 2>/dev/null || terraform -chdir=$(INFRA_DIR) output -raw ecr_repository_url); \
	docker push $$ECR_URL:latest

.PHONY: build-frontend
build-frontend:
	@echo "Building frontend container for linux/amd64 (API configured for /api/v1)..."
	@ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_frontend_repository_url 2>/dev/null || echo "meeting-frontend"); \
	docker build --platform linux/amd64 --build-arg VITE_API_BASE_URL=/api/v1 -t $$ECR_URL:latest $(FRONTEND_DIR)

.PHONY: push-frontend
push-frontend: check-aws ecr-login build-frontend
	@echo "Pushing frontend container image to Amazon ECR..."
	@ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_frontend_repository_url 2>/dev/null); \
	if [ -z "$$ECR_URL" ]; then \
		terraform -chdir=$(INFRA_DIR) apply -target=aws_ecr_repository.frontend -target=aws_ecr_lifecycle_policy.frontend -auto-approve; \
		ECR_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw ecr_frontend_repository_url); \
	fi; \
	docker push $$ECR_URL:latest

.PHONY: build-all
build-all: build-backend build-frontend

.PHONY: push-all
push-all: push-backend push-frontend

.PHONY: ecs-deploy
ecs-deploy: check-aws
	@echo "Triggering rolling update for ECS Fargate service in $(AWS_REGION)..."
	@CLUSTER=$$(terraform -chdir=$(INFRA_DIR) output -raw ecs_cluster_name); \
	SERVICE=$$(terraform -chdir=$(INFRA_DIR) output -raw ecs_service_name); \
	aws ecs update-service --cluster $$CLUSTER --service $$SERVICE --force-new-deployment --region $(AWS_REGION)

.PHONY: deploy
deploy: check-aws
	@echo "================================================================================"
	@echo " Deploying Full Stack to AWS ECS Fargate & Database to AWS RDS"
	@echo " Target Region: $(AWS_REGION)"
	@echo " Target Domain: 1233.pp.ua"
	@echo "================================================================================"
	@echo "Step 1/4: Initializing Terraform..."
	@terraform -chdir=$(INFRA_DIR) init -input=false
	@echo "Step 2/4: Ensuring Amazon ECR Repositories exist in $(AWS_REGION)..."
	@terraform -chdir=$(INFRA_DIR) apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend -target=aws_ecr_lifecycle_policy.backend -target=aws_ecr_lifecycle_policy.frontend -auto-approve
	@echo "Step 3/4: Building and pushing Backend & Frontend Docker images to ECR..."
	@$(MAKE) push-backend
	@$(MAKE) push-frontend
	@echo "Step 4/4: Applying all infrastructure (VPC, RDS PostgreSQL, ALB routing, ECS Fargate)..."
	@terraform -chdir=$(INFRA_DIR) apply -auto-approve
	@echo ""
	@echo "================================================================================"
	@echo " Waiting for services to become healthy..."
	@echo "================================================================================"
	@ALB_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw alb_url); \
	HEALTH_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw backend_health_url); \
	for i in {1..24}; do \
		FE_STATUS=$$(curl -s -o /dev/null -w "%{http_code}" $$ALB_URL || true); \
		BE_STATUS=$$(curl -s -o /dev/null -w "%{http_code}" $$HEALTH_URL || true); \
		if [ "$$FE_STATUS" = "200" ] && [ "$$BE_STATUS" = "200" ]; then \
			echo "Frontend (HTTP $$FE_STATUS) and Backend (HTTP $$BE_STATUS) are live and healthy!"; \
			break; \
		fi; \
		echo "Waiting for targets to report healthy (Frontend: $$FE_STATUS, Backend: $$BE_STATUS, attempt $$i/24)..."; \
		sleep 5; \
	done
	@echo ""
	@echo "================================================================================"
	@echo " Deployment Complete!"
	@echo "================================================================================"
	@echo "Cloudflare CNAME Target (Value to copy into Cloudflare):"
	@terraform -chdir=$(INFRA_DIR) output -raw cloudflare_cname_target
	@echo ""
	@echo "Your Site URL:"
	@terraform -chdir=$(INFRA_DIR) output -raw site_url
	@echo ""
	@echo "Direct ALB Frontend URL:"
	@terraform -chdir=$(INFRA_DIR) output -raw alb_url
	@echo ""
	@echo "Direct ALB Backend Health URL:"
	@terraform -chdir=$(INFRA_DIR) output -raw backend_health_url
	@echo ""

.PHONY: status
status:
	@echo "Checking AWS deployment status..."
	@ALB_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw alb_url 2>/dev/null || true); \
	HEALTH_URL=$$(terraform -chdir=$(INFRA_DIR) output -raw backend_health_url 2>/dev/null || true); \
	CNAME_TARGET=$$(terraform -chdir=$(INFRA_DIR) output -raw cloudflare_cname_target 2>/dev/null || true); \
	if [ -n "$$ALB_URL" ]; then \
		echo "Cloudflare CNAME Target: $$CNAME_TARGET"; \
		echo "Frontend Status ($$ALB_URL):"; \
		curl -s -m 5 -w "\nHTTP Status: %{http_code}\n" $$ALB_URL | head -n 5 || echo "Frontend unreachable."; \
		echo "Backend Health Status ($$HEALTH_URL):"; \
		curl -s -m 5 -w "\nHTTP Status: %{http_code}\n" $$HEALTH_URL || echo "Backend unreachable."; \
	else \
		echo "Infrastructure outputs not found. Run 'make deploy' first."; \
	fi
