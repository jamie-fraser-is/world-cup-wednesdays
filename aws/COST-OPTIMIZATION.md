# AWS Cost Optimization Guide

## 💰 Cost Breakdown & Savings

### Current Optimized Architecture (eu-west-2)

| Service | Configuration | Monthly Cost (USD) | Savings Applied |
|---------|---------------|-------------------|-----------------|
| **RDS PostgreSQL** | db.t3.micro, 20GB, Single-AZ | ~$15-18 | ✅ Micro instance, Single-AZ, Short backups |
| **ECS Fargate** | 256-512 CPU, 512-1024 MB | ~$15-25 | ✅ Fargate Spot (70% savings), Right-sized |
| **Application Load Balancer** | Standard ALB | ~$16 | ⚠️ Required for production |
| **CloudWatch Logs** | 7-30 day retention | ~$2-5 | ✅ Short retention for staging |
| **ECR** | Image storage | ~$1-3 | ✅ Lifecycle policies |
| **Data Transfer** | Minimal usage | ~$1-2 | ✅ Single region |
| **NAT Gateway** | Not used | $0 | ✅ Public subnets for containers |

**Total Estimated Monthly Cost: $50-70 USD**

### 🎯 Major Cost Savings Implemented

#### 1. **Fargate Spot Instances (70% Cost Reduction)**
```yaml
DefaultCapacityProviderStrategy:
  - CapacityProvider: FARGATE_SPOT
    Weight: 4
  - CapacityProvider: FARGATE
    Weight: 1
```
- **Savings**: ~$10-15/month
- **Trade-off**: Potential interruptions (rare for web apps)

#### 2. **Right-Sized Resources**
```yaml
staging:
  BackendCpu: 256      # Minimal for development
  BackendMemory: 512
  FrontendCpu: 256
  FrontendMemory: 512
```
- **Savings**: ~$20-30/month vs. over-provisioned
- **Trade-off**: May need scaling for high load

#### 3. **Single-AZ Database (50% Cost Reduction)**
```yaml
MultiAZ: false  # Disabled for cost savings
BackupRetentionPeriod: 1  # Minimal backups for staging
```
- **Savings**: ~$15-20/month
- **Trade-off**: Lower availability (acceptable for staging)

#### 4. **Optimized Logging**
```yaml
RetentionInDays: !If [IsProduction, 30, 7]
```
- **Savings**: ~$5-10/month
- **Trade-off**: Shorter log history

#### 5. **No NAT Gateway**
- **Savings**: ~$32/month (NAT Gateway cost)
- **Implementation**: Containers in public subnets with security groups

### 🏗️ Alternative Minimal Architecture

For maximum cost savings, use `infrastructure-minimal.yml`:

| Service | Minimal Config | Monthly Cost (USD) |
|---------|---------------|-------------------|
| **RDS** | t3.micro, Single-AZ, No encryption | ~$12 |
| **ECS** | Fargate Spot only, 256 CPU/512 MB | ~$8-12 |
| **ALB** | Single AZ | ~$16 |
| **Logs** | 3-day retention | ~$1 |
| **ECR** | 3 image limit | ~$1 |

**Total Minimal Cost: ~$25-35 USD/month**

## 📊 Cost Monitoring & Alerts

### 1. Set up AWS Budgets
```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget '{
    "BudgetName": "WCW-Monthly-Budget",
    "BudgetLimit": {
      "Amount": "50",
      "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }'
```

### 2. CloudWatch Cost Anomaly Detection
```yaml
CostAnomalyDetector:
  Type: AWS::CE::AnomalyDetector
  Properties:
    AnomalyDetectorName: wcw-cost-anomaly
    MonitorType: DIMENSIONAL
    MonitorSpecification:
      DimensionKey: SERVICE
      MatchOptions: [EQUALS]
      Values: [Amazon Elastic Container Service, Amazon Relational Database Service]
```

### 3. Daily Cost Monitoring Script
```bash
#!/bin/bash
# Get yesterday's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "yesterday" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 🔧 Additional Cost Optimization Strategies

### 1. **Reserved Instances (Future)**
When usage patterns stabilize:
- RDS Reserved Instance: 30-60% savings
- Savings Plans for Fargate: 20% savings

### 2. **Scheduled Scaling**
```yaml
# Scale down during off-hours
ScheduledActionScaleDown:
  Type: AWS::ApplicationAutoScaling::ScheduledAction
  Properties:
    Schedule: cron(0 18 * * MON-FRI)  # 6 PM weekdays
    ScalableTargetAction:
      MinCapacity: 0
      MaxCapacity: 0
```

### 3. **Development Environment Automation**
```bash
# Auto-shutdown script for development
aws ecs update-service \
  --cluster wcw-staging \
  --service wcw-backend-staging \
  --desired-count 0
```

### 4. **S3 for Static Assets (Future Enhancement)**
- Move images to S3 with CloudFront
- Cost: ~$1-5/month vs. container storage
- Performance: Better global delivery

### 5. **Database Optimization**
```sql
-- Regular maintenance
VACUUM ANALYZE;
REINDEX DATABASE world_cup_wednesdays;

-- Monitor query performance
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

## 🎯 Cost vs. Performance Trade-offs

### ✅ **Acceptable Trade-offs**
- **Fargate Spot**: 2-3% interruption rate for 70% cost savings
- **Single-AZ RDS**: 99.5% vs 99.95% availability for 50% savings
- **Smaller instances**: Adequate for current load, can scale up
- **Short log retention**: Sufficient for debugging recent issues

### ⚠️ **Monitor Carefully**
- **Container resource limits**: Watch for OOM kills
- **Database connections**: Monitor connection pool usage
- **Response times**: Ensure user experience isn't impacted

### ❌ **Not Recommended**
- **Removing ALB**: Required for SSL and routing
- **No backups**: Data loss risk too high
- **Shared databases**: Security and isolation concerns

## 📈 Scaling Strategy

### Phase 1: Current (0-100 users)
- Current optimized setup: $50-70/month
- Single instance of each service

### Phase 2: Growth (100-1000 users)
- Enable auto-scaling: $70-120/month
- Add RDS read replica: +$15/month
- Consider Reserved Instances: -20% costs

### Phase 3: Scale (1000+ users)
- Multi-AZ RDS: +$15/month
- CDN for static assets: +$5-10/month
- Dedicated instances: +$50-100/month

## 🔍 Cost Monitoring Dashboard

### Key Metrics to Track
1. **Daily spend by service**
2. **Cost per active user**
3. **Resource utilization rates**
4. **Fargate Spot interruption rate**
5. **Database connection usage**

### Alerts to Set Up
- Daily spend > $3
- Monthly projection > $75
- Fargate Spot interruption > 5%
- Database CPU > 80%
- Container memory > 90%

## 💡 Pro Tips

1. **Use AWS Cost Explorer** regularly to identify trends
2. **Tag all resources** for better cost allocation
3. **Review monthly** and adjust based on actual usage
4. **Consider AWS Free Tier** for development/testing
5. **Use Spot instances** for non-critical workloads
6. **Implement auto-shutdown** for development environments
7. **Monitor unused resources** and clean up regularly

This setup provides a production-ready application for under $70/month while maintaining good performance and reliability!