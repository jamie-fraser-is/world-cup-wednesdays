#!/bin/bash

# World Cup Wednesdays - AWS Deployment Script

set -e

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-eu-west-2}
STACK_NAME="wcw-infrastructure-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying World Cup Wednesdays to AWS${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${AWS_REGION}${NC}"
echo -e "${YELLOW}Stack: ${STACK_NAME}${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure'${NC}"
    exit 1
fi

# Check if required parameters are set
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ DB_PASSWORD environment variable is required${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET environment variable is required${NC}"
    exit 1
fi

# Deploy CloudFormation stack
echo -e "${YELLOW}📦 Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file aws/cloudformation/infrastructure.yml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        ImageTag=latest \
        DatabasePassword=$DB_PASSWORD \
        JWTSecret=$JWT_SECRET \
    --capabilities CAPABILITY_IAM \
    --region $AWS_REGION

# Get stack outputs
echo -e "${YELLOW}📋 Getting stack outputs...${NC}"
LOAD_BALANCER_DNS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text \
    --region $AWS_REGION)

DATABASE_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
    --output text \
    --region $AWS_REGION)

BACKEND_REPO_URI=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendRepositoryURI`].OutputValue' \
    --output text \
    --region $AWS_REGION)

FRONTEND_REPO_URI=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendRepositoryURI`].OutputValue' \
    --output text \
    --region $AWS_REGION)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Deployment Information:${NC}"
echo -e "${YELLOW}🌐 Application URL: http://${LOAD_BALANCER_DNS}${NC}"
echo -e "${YELLOW}🗄️  Database Endpoint: ${DATABASE_ENDPOINT}${NC}"
echo -e "${YELLOW}🐳 Backend Repository: ${BACKEND_REPO_URI}${NC}"
echo -e "${YELLOW}🐳 Frontend Repository: ${FRONTEND_REPO_URI}${NC}"
echo ""
echo -e "${GREEN}🔧 Next Steps:${NC}"
echo "1. Build and push Docker images to ECR repositories"
echo "2. Update ECS services to use new images"
echo "3. Run database migrations if needed"
echo ""
echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo "aws ecs list-services --cluster wcw-${ENVIRONMENT} --region ${AWS_REGION}"
echo "aws logs tail /ecs/wcw-backend-${ENVIRONMENT} --follow --region ${AWS_REGION}"
echo "aws rds describe-db-instances --db-instance-identifier wcw-db-${ENVIRONMENT} --region ${AWS_REGION}"