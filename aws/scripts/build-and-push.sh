#!/bin/bash

# Build and push Docker images to ECR

set -e

# Configuration
AWS_REGION=${AWS_REGION:-eu-west-2}
IMAGE_TAG=${IMAGE_TAG:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Building and pushing Docker images${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend image
echo -e "${YELLOW}🏗️  Building backend image...${NC}"
docker build -t wcw-backend:$IMAGE_TAG ./server
docker tag wcw-backend:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-backend:$IMAGE_TAG
docker tag wcw-backend:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-backend:latest

echo -e "${YELLOW}📤 Pushing backend image...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-backend:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-backend:latest

# Build and push frontend image
echo -e "${YELLOW}🏗️  Building frontend image...${NC}"
docker build -f ./client/Dockerfile.prod -t wcw-frontend:$IMAGE_TAG ./client
docker tag wcw-frontend:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-frontend:$IMAGE_TAG
docker tag wcw-frontend:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-frontend:latest

echo -e "${YELLOW}📤 Pushing frontend image...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-frontend:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/wcw-frontend:latest

echo -e "${GREEN}✅ Images built and pushed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Image Information:${NC}"
echo -e "${YELLOW}Backend: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wcw-backend:${IMAGE_TAG}${NC}"
echo -e "${YELLOW}Frontend: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wcw-frontend:${IMAGE_TAG}${NC}"