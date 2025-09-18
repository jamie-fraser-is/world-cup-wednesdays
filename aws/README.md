# AWS Deployment Guide

This directory contains all the necessary files and scripts to deploy World Cup Wednesdays to AWS using modern cloud-native practices.

## 🏗️ Architecture Overview

### AWS Services Used
- **ECS Fargate**: Container orchestration for backend and frontend
- **RDS PostgreSQL**: Managed database service
- **Application Load Balancer**: Traffic distribution and SSL termination
- **ECR**: Container image registry
- **VPC**: Network isolation and security
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Secure credential storage

### Infrastructure as Code
- **CloudFormation**: Complete infrastructure definition
- **GitHub Actions**: CI/CD pipeline automation
- **Docker**: Containerized applications

## 🚀 Quick Deployment

### Prerequisites
1. AWS CLI configured with appropriate permissions
2. Docker installed locally
3. GitHub repository with secrets configured

### GitHub Secrets Required
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
DB_PASSWORD
JWT_SECRET
```

### One-Click Deployment
Push to `main` branch - GitHub Actions will automatically:
1. Run tests
2. Build Docker images
3. Push to ECR
4. Deploy infrastructure
5. Update ECS services
6. Run smoke tests

## 🛠️ Manual Deployment

### 1. Deploy Infrastructure
```bash
# Set environment variables
export DB_PASSWORD="your-secure-password"
export JWT_SECRET="your-jwt-secret-key"
export AWS_REGION="us-east-1"

# Deploy to staging
./aws/scripts/deploy.sh staging

# Deploy to production
./aws/scripts/deploy.sh production
```

### 2. Build and Push Images
```bash
# Build and push Docker images
./aws/scripts/build-and-push.sh
```

### 3. Run Database Migrations
```bash
# Migrate database schema
./aws/scripts/migrate-database.sh staging
```

## 📊 Monitoring and Maintenance

### CloudWatch Logs
- Backend logs: `/ecs/wcw-backend-{environment}`
- Frontend logs: `/ecs/wcw-frontend-{environment}`

### Useful AWS CLI Commands
```bash
# Check ECS service status
aws ecs describe-services --cluster wcw-staging --services wcw-backend-staging

# View recent logs
aws logs tail /ecs/wcw-backend-staging --follow

# Check database status
aws rds describe-db-instances --db-instance-identifier wcw-db-staging

# Update ECS service
aws ecs update-service --cluster wcw-staging --service wcw-backend-staging --force-new-deployment
```

### Scaling
```bash
# Scale ECS service
aws ecs update-service --cluster wcw-staging --service wcw-backend-staging --desired-count 3
```

## 🔒 Security Features

### Network Security
- Private subnets for application and database
- Security groups with minimal required access
- VPC isolation

### Data Security
- RDS encryption at rest
- Secrets Manager for credentials
- SSL/TLS in transit

### Application Security
- Container image scanning
- IAM roles with least privilege
- Security headers via Helmet.js

## 🌍 Multi-Environment Setup

### Staging Environment
- Single AZ deployment
- Smaller instance sizes
- Seed data included
- Development-friendly settings

### Production Environment
- Multi-AZ deployment
- Larger instance sizes
- No seed data
- Production-optimized settings

## 🔄 CI/CD Pipeline

### Continuous Integration
1. **Code Quality**: ESLint, security audits
2. **Testing**: Unit tests, integration tests
3. **Build**: Docker image creation
4. **Security**: Container vulnerability scanning

### Continuous Deployment
1. **Infrastructure**: CloudFormation stack updates
2. **Images**: ECR push and ECS service updates
3. **Database**: Automated migrations
4. **Verification**: Smoke tests and health checks

## 📈 Cost Optimization

### Fargate Spot
- Uses Fargate Spot instances for cost savings
- Automatic failover to regular Fargate

### Resource Sizing
- Environment-specific instance sizes
- Auto-scaling based on demand

### Storage Optimization
- ECR lifecycle policies
- CloudWatch log retention policies

## 🚨 Troubleshooting

### Common Issues

#### ECS Service Won't Start
```bash
# Check service events
aws ecs describe-services --cluster wcw-staging --services wcw-backend-staging

# Check task definition
aws ecs describe-task-definition --task-definition wcw-backend-staging
```

#### Database Connection Issues
```bash
# Test database connectivity
aws rds describe-db-instances --db-instance-identifier wcw-db-staging

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

#### Load Balancer Issues
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...

# Check load balancer
aws elbv2 describe-load-balancers --names wcw-alb-staging
```

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /health`
- Database: Connection test in backend health check

## 📝 Maintenance Tasks

### Regular Updates
1. Update base Docker images
2. Apply security patches
3. Update dependencies
4. Review and rotate secrets

### Backup Strategy
- RDS automated backups (7 days retention)
- Point-in-time recovery available
- Cross-region backup for production

### Disaster Recovery
1. Infrastructure recreated via CloudFormation
2. Database restored from automated backups
3. Application deployed via CI/CD pipeline

## 🎯 Performance Optimization

### Application Performance
- Container resource limits
- Database connection pooling
- CDN for static assets (future enhancement)

### Database Performance
- Appropriate instance sizing
- Connection pooling
- Query optimization

### Network Performance
- Application Load Balancer
- VPC optimized routing
- Regional deployment

## 📞 Support

### Monitoring Alerts
Set up CloudWatch alarms for:
- High CPU/Memory usage
- Database connection errors
- Application errors
- Load balancer 5xx errors

### Logging Strategy
- Structured logging with JSON format
- Centralized log aggregation
- Log retention policies
- Error tracking and alerting