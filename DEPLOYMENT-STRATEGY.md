# Deployment Strategy & Environment Management

## 🏗️ Recommended Environment Strategy

### **Three-Environment Approach**

```
Development → Staging → Production
    ↓           ↓          ↓
  Local      AWS Test   AWS Prod
```

## 🌍 Environment Breakdown

### 1. **Development Environment**
**Purpose**: Local development and initial testing
**Infrastructure**: Docker Compose on developer machines
**Database**: Local PostgreSQL container with seed data

```bash
# Start development environment
docker-compose up --build

# Access
Frontend: http://localhost:3000
Backend: http://localhost:5000
Database: localhost:5432
```

**Characteristics**:
- ✅ Hot reload enabled
- ✅ Debug logging
- ✅ Seed data included
- ✅ All features enabled
- ✅ No cost (local only)

### 2. **Staging Environment**
**Purpose**: Pre-production testing, QA, and stakeholder demos
**Infrastructure**: AWS (eu-west-2) with cost optimizations
**Database**: RDS PostgreSQL with seed data

```bash
# Deploy to staging
git push origin develop  # Triggers staging deployment
```

**Characteristics**:
- ✅ Production-like infrastructure
- ✅ Real AWS services
- ✅ Seed data for testing
- ✅ Cost-optimized ($25-35/month)
- ✅ Single-AZ deployment
- ✅ Short log retention
- ✅ Fargate Spot instances

### 3. **Production Environment**
**Purpose**: Live application for end users
**Infrastructure**: AWS (eu-west-2) with reliability optimizations
**Database**: RDS PostgreSQL without seed data

```bash
# Deploy to production
git push origin main  # Triggers production deployment
```

**Characteristics**:
- ✅ High availability
- ✅ Auto-scaling enabled
- ✅ Longer log retention
- ✅ Monitoring and alerts
- ✅ No seed data
- ✅ Enhanced security
- ⚠️ Higher cost ($50-70/month)

## 🚀 Deployment Workflow

### **Branch Strategy**
```
main (production)
├── develop (staging)
├── feature/tournament-brackets
├── feature/admin-portal
└── hotfix/voting-bug
```

### **Automated Deployment Pipeline**

#### **1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Develop locally
docker-compose up

# Test changes
npm test

# Push for review
git push origin feature/new-feature
```

#### **2. Staging Deployment**
```bash
# Merge to develop branch
git checkout develop
git merge feature/new-feature
git push origin develop

# GitHub Actions automatically:
# 1. Runs all tests
# 2. Builds Docker images
# 3. Deploys to staging
# 4. Runs smoke tests
```

#### **3. Production Deployment**
```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# GitHub Actions automatically:
# 1. Runs comprehensive tests
# 2. Builds production images
# 3. Deploys to production
# 4. Runs health checks
# 5. Sends notifications
```

## 📋 Environment Configuration

### **Environment Variables by Stage**

#### Development (.env.local)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user
DB_PASSWORD=password
JWT_SECRET=dev-secret-key
ENABLE_SEED_DATA=true
LOG_LEVEL=debug
```

#### Staging (AWS Parameter Store)
```env
NODE_ENV=staging
DB_HOST=wcw-db-staging.xxx.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user
DB_PASSWORD=<from-secrets-manager>
JWT_SECRET=<from-secrets-manager>
ENABLE_SEED_DATA=true
LOG_LEVEL=info
```

#### Production (AWS Parameter Store)
```env
NODE_ENV=production
DB_HOST=wcw-db-production.xxx.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user
DB_PASSWORD=<from-secrets-manager>
JWT_SECRET=<from-secrets-manager>
ENABLE_SEED_DATA=false
LOG_LEVEL=warn
```

## 🔄 Deployment Process

### **Daily Development Workflow**

#### Morning Setup
```bash
# Pull latest changes
git checkout develop
git pull origin develop

# Start local environment
docker-compose up -d

# Check application health
curl http://localhost:5000/api/health
```

#### Feature Development
```bash
# Create feature branch
git checkout -b feature/user-voting

# Make changes and test locally
# ... development work ...

# Run tests
npm test

# Commit and push
git add .
git commit -m "Add user voting functionality"
git push origin feature/user-voting
```

#### Testing in Staging
```bash
# Merge to develop (triggers staging deployment)
git checkout develop
git merge feature/user-voting
git push origin develop

# Wait for deployment (5-10 minutes)
# Test on staging: https://staging.worldcupwednesdays.com
```

#### Production Release
```bash
# Weekly/bi-weekly production releases
git checkout main
git merge develop
git tag v1.2.0
git push origin main --tags

# Monitor deployment
aws ecs describe-services --cluster wcw-production
```

### **Rollback Strategy**

#### Quick Rollback (ECS)
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster wcw-production \
  --service wcw-backend-production \
  --task-definition wcw-backend-production:PREVIOUS

# Or rollback via GitHub
git revert <commit-hash>
git push origin main
```

#### Database Rollback
```bash
# Restore from automated backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier wcw-db-production-rollback \
  --db-snapshot-identifier wcw-db-production-2024-01-15-backup
```

## 📊 Environment Monitoring

### **Health Checks**

#### Development
```bash
# Local health check script
#!/bin/bash
echo "Checking local services..."
curl -f http://localhost:5000/api/health || echo "Backend down"
curl -f http://localhost:3000 || echo "Frontend down"
docker ps | grep postgres || echo "Database down"
```

#### Staging/Production
```bash
# AWS health monitoring
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:eu-west-2:...

# Application health
curl -f https://staging.worldcupwednesdays.com/api/health
curl -f https://worldcupwednesdays.com/api/health
```

### **Monitoring Dashboard**

#### Key Metrics to Track
- **Application**: Response time, error rate, active users
- **Infrastructure**: CPU, memory, database connections
- **Business**: Competition participation, voting activity
- **Costs**: Daily spend, resource utilization

#### Alerts Setup
```yaml
# CloudWatch Alarms
- High error rate (>5%)
- High response time (>2s)
- Database CPU (>80%)
- Daily cost (>$3)
- Container failures
```

## 🔐 Security & Compliance

### **Environment Isolation**
- **Separate AWS accounts** (recommended for large orgs)
- **Separate VPCs** for staging/production
- **Different IAM roles** per environment
- **Encrypted secrets** in AWS Secrets Manager

### **Access Control**
```yaml
Development:
  - All developers: Full access
  - Database: Local containers

Staging:
  - Developers: Read access
  - QA Team: Full testing access
  - Database: AWS RDS (restricted)

Production:
  - DevOps: Deployment access
  - Developers: Read-only logs
  - Database: AWS RDS (highly restricted)
```

## 📅 Release Schedule

### **Recommended Cadence**

#### **Daily** (Development)
- Feature development
- Local testing
- Code reviews

#### **Weekly** (Staging)
- Merge features to develop
- Deploy to staging
- QA testing
- Stakeholder demos

#### **Bi-weekly** (Production)
- Merge develop to main
- Production deployment
- Post-deployment monitoring
- Release notes

### **Emergency Releases**
```bash
# Hotfix process
git checkout main
git checkout -b hotfix/critical-bug
# ... fix ...
git push origin hotfix/critical-bug

# Direct to production (skip staging for critical issues)
git checkout main
git merge hotfix/critical-bug
git push origin main
```

## 💡 Best Practices

### **Development**
1. **Always test locally first**
2. **Use feature flags** for incomplete features
3. **Write tests** before pushing
4. **Keep commits small** and focused
5. **Use descriptive commit messages**

### **Staging**
1. **Test all user journeys**
2. **Verify integrations** work
3. **Check performance** under load
4. **Validate data migrations**
5. **Test rollback procedures**

### **Production**
1. **Deploy during low-traffic hours**
2. **Monitor closely** after deployment
3. **Have rollback plan ready**
4. **Communicate** with stakeholders
5. **Document** any issues

### **General**
1. **Infrastructure as Code** (CloudFormation)
2. **Automated testing** in CI/CD
3. **Blue-green deployments** for zero downtime
4. **Database migrations** in separate step
5. **Feature toggles** for gradual rollouts

## 🎯 Success Metrics

### **Deployment Success**
- **Deployment frequency**: Weekly to production
- **Lead time**: <2 hours from commit to production
- **Mean time to recovery**: <30 minutes
- **Change failure rate**: <5%

### **Application Health**
- **Uptime**: >99.5%
- **Response time**: <2 seconds
- **Error rate**: <1%
- **User satisfaction**: Positive feedback

This strategy provides a robust, scalable approach to managing your application across environments while maintaining cost efficiency and reliability!