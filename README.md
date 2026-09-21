# Meeting Management System (OOAD)

Full-stack application featuring a FastAPI asynchronous backend, React frontend, PostgreSQL database, and AWS Free Tier cloud infrastructure.

## Local Development (Docker Compose)

The project includes a [Makefile](file:///home/sasha/work_dir/OOAD/Makefile) for managing Docker Compose services:

```bash
# Start all local containers (backend, frontend, database)
make up

# Check container status
make ps

# View live container logs
make logs

# Stop containers
make down

# Clean restart with database volume wipe
make clean
```

- Backend API: [http://localhost:8000](http://localhost:8000)
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Frontend UI: [http://localhost:3000](http://localhost:3000)

---

## AWS Deployment (ECS Fargate & RDS Free Tier)

All cloud infrastructure is defined with Terraform in [`infra/`](file:///home/sasha/work_dir/OOAD/infra).

### 1. Configure AWS Credentials

Add your AWS credentials to [`.env`](file:///home/sasha/work_dir/OOAD/.env):

```ini
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
```

### 2. Deploy Everything to AWS

Run the automated deployment pipeline:

```bash
make deploy
```

This target automatically:
1. Validates AWS credentials.
2. Initializes Terraform in [`infra/`](file:///home/sasha/work_dir/OOAD/infra).
3. Creates the Amazon ECR repository.
4. Builds the backend Docker container for `linux/amd64` and pushes it to ECR.
5. Deploys the Free Tier VPC, RDS PostgreSQL instance, Application Load Balancer (ALB), and ECS Fargate service.
6. Outputs the live backend ALB URL and health endpoint.

### 3. Check Status & Tear Down

```bash
# Verify backend deployment health
make status

# Check infrastructure outputs
make infra-output

# Tear down all AWS resources when finished
make infra-destroy
```

### Free Tier Specifications

- **Amazon RDS**: PostgreSQL 16 on `db.t3.micro`, 20 GB gp3 storage, Single-AZ, no auto-expansion.
- **AWS Fargate**: Minimal compute allocation (0.25 vCPU / 256 CPU units, 512 MiB RAM), single task instance.
- **Amazon ECR**: Auto-lifecycle policy retaining only the latest 3 images (< 500 MB).
- **VPC Networking**: Direct public subnet egress via Internet Gateway for ECR image pulls, avoiding expensive NAT Gateways ($0 networking cost).
