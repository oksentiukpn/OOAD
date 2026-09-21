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
AWS_REGION=eu-north-1
```

### 2. Deploy Everything to AWS (CLI)

Run the automated deployment pipeline:

```bash
make deploy
```

This target automatically:
1. Validates AWS credentials.
2. Initializes Terraform in [`infra/`](file:///home/sasha/work_dir/OOAD/infra).
3. Ensures Amazon ECR repositories exist for both backend and frontend.
4. Builds backend and frontend Docker containers for `linux/amd64` and pushes them to Amazon ECR.
5. Deploys/updates the Free Tier VPC, RDS PostgreSQL instance, Application Load Balancer (ALB), listener rules, and ECS Fargate service.
6. Waits for both containers to report healthy (HTTP 200).

---

## Automated CI/CD (GitHub Actions)

An automated deployment pipeline is configured in [`.github/workflows/deploy.yml`](file:///home/sasha/work_dir/OOAD/.github/workflows/deploy.yml).

### Trigger
- Runs automatically on every `push` to branch `main`.
- Can also be manually triggered anytime via the **Run workflow** button in GitHub Actions (`workflow_dispatch`).

### Required GitHub Secrets
In your GitHub repository, navigate to **Settings** $\to$ **Secrets and variables** $\to$ **Actions** $\to$ **New repository secret**:

| Secret Name | Value Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your AWS IAM Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Your AWS IAM Secret Access Key |
| `AWS_REGION` | *(Optional)* Default: `eu-north-1` |

### Pipeline Workflow
1. Checks out repository code.
2. Authenticates with AWS and logs in to Amazon ECR.
3. Builds and tags both Backend and Frontend Docker images (`:latest` and `:${{ github.sha }}`) with GitHub Actions layer caching.
4. Pushes images to Amazon ECR.
5. Triggers zero-downtime rolling update on AWS ECS Fargate service (`meeting-app-app-service`).
6. Waits for service to reach steady state and tests the health endpoints.

---

### Free Tier Specifications

- **Amazon RDS**: PostgreSQL 16 on `db.t3.micro`, 20 GB gp3 storage, Single-AZ, no auto-expansion.
- **AWS Fargate**: Minimal compute allocation (0.25 vCPU / 256 CPU units, 512 MiB RAM), co-located containers in single task instance.
- **Amazon ECR**: Auto-lifecycle policy retaining only the latest 3 images (< 500 MB).
- **VPC Networking**: Direct public subnet egress via Internet Gateway for ECR image pulls, avoiding expensive NAT Gateways ($0 networking cost).
