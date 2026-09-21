resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = var.db_engine_version
  instance_class    = var.db_instance_class
  allocated_storage = 20

  # Restrict autoscaling to remain strictly inside the 20 GB Free Tier limit
  max_allocated_storage = 20
  storage_type          = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false
  multi_az            = false

  skip_final_snapshot       = true
  final_snapshot_identifier = "${var.project_name}-db-final-snapshot"

  backup_retention_period    = 0
  auto_minor_version_upgrade = true
  deletion_protection        = false

  tags = {
    Name = "${var.project_name}-rds"
  }
}
