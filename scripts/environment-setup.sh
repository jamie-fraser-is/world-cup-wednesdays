#!/bin/bash

# Environment Setup Script for World Cup Wednesdays
# Usage: ./scripts/environment-setup.sh [development|staging|production]

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up World Cup Wednesdays - ${ENVIRONMENT} environment${NC}"

case $ENVIRONMENT in
  "development")
    echo -e "${GREEN}📦 Setting up local development environment...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}📝 Creating .env file...${NC}"
        cat > "$PROJECT_ROOT/.env" << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user
DB_PASSWORD=password
JWT_SECRET=dev-secret-key-change-in-production
ENABLE_SEED_DATA=true
LOG_LEVEL=debug
EOF
    fi
    
    # Start development environment
    echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
    sleep 10
    
    # Health check
    echo -e "${YELLOW}🔍 Checking service health...${NC}"
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi
    
    echo -e "${GREEN}🎉 Development environment is ready!${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
    echo -e "${BLUE}🗄️  Database: localhost:5432${NC}"
    ;;
    
  "staging")
    echo -e "${GREEN}☁️  Setting up staging environment on AWS...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'.${NC}"
        exit 1
    fi
    
    # Check required environment variables
    if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}❌ Required environment variables not set:${NC}"
        echo -e "${YELLOW}export DB_PASSWORD='your-secure-password'${NC}"
        echo -e "${YELLOW}export JWT_SECRET='your-jwt-secret-32-chars-minimum'${NC}"
        exit 1
    fi
    
    # Deploy infrastructure
    echo -e "${YELLOW}🏗️  Deploying staging infrastructure...${NC}"
    "$PROJECT_ROOT/aws/scripts/deploy.sh" staging
    
    # Build and push images
    echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"
    "$PROJECT_ROOT/aws/scripts/build-and-push.sh"
    
    # Run database migrations
    echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
    "$PROJECT_ROOT/aws/scripts/migrate-database.sh" staging
    
    echo -e "${GREEN}🎉 Staging environment deployed!${NC}"
    ;;
    
  "production")
    echo -e "${GREEN}🏭 Setting up production environment on AWS...${NC}"
    
    # Extra confirmation for production
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION.${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Deployment cancelled.${NC}"
        exit 0
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'.${NC}"
        exit 1
    fi
    
    # Check required environment variables
    if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}❌ Required environment variables not set:${NC}"
        echo -e "${YELLOW}export DB_PASSWORD='your-secure-production-password'${NC}"
        echo -e "${YELLOW}export JWT_SECRET='your-production-jwt-secret-32-chars-minimum'${NC}"
        exit 1
    fi
    
    # Deploy infrastructure
    echo -e "${YELLOW}🏗️  Deploying production infrastructure...${NC}"
    "$PROJECT_ROOT/aws/scripts/deploy.sh" production
    
    # Build and push images
    echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"
    "$PROJECT_ROOT/aws/scripts/build-and-push.sh"
    
    # Run database migrations (without seed data)
    echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
    "$PROJECT_ROOT/aws/scripts/migrate-database.sh" production
    
    echo -e "${GREEN}🎉 Production environment deployed!${NC}"
    echo -e "${YELLOW}📊 Monitor the deployment and set up alerts.${NC}"
    ;;
    
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: $0 [development|staging|production]${NC}"
    exit 1
    ;;
esac

echo -e "${BLUE}📚 Next steps:${NC}"
case $ENVIRONMENT in
  "development")
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Login with demo account: admin@example.com / password"
    echo "3. Start developing!"
    echo "4. Run 'docker-compose logs -f' to view logs"
    echo "5. Run 'docker-compose down' to stop services"
    ;;
  "staging"|"production")
    echo "1. Check the deployment status in AWS Console"
    echo "2. Test the application endpoints"
    echo "3. Set up monitoring and alerts"
    echo "4. Update DNS records if needed"
    echo "5. Notify stakeholders of the deployment"
    ;;
esac