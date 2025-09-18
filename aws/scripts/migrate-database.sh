#!/bin/bash

# Database migration script for AWS RDS

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

echo -e "${GREEN}🗄️  Running database migrations${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Get database endpoint from CloudFormation
DATABASE_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
    --output text \
    --region $AWS_REGION)

if [ -z "$DATABASE_ENDPOINT" ]; then
    echo -e "${RED}❌ Could not get database endpoint from CloudFormation stack${NC}"
    exit 1
fi

echo -e "${YELLOW}Database endpoint: ${DATABASE_ENDPOINT}${NC}"

# Check if required environment variables are set
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ DB_PASSWORD environment variable is required${NC}"
    exit 1
fi

# Database connection parameters
DB_HOST=$DATABASE_ENDPOINT
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Run schema migration
echo -e "${YELLOW}📋 Running schema migration...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f server/database/init/01-schema.sql

# Run seed data (only for staging)
if [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}🌱 Running seed data migration...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f server/database/init/02-seed-data.sql
else
    echo -e "${YELLOW}⚠️  Skipping seed data for production environment${NC}"
fi

echo -e "${GREEN}✅ Database migrations completed successfully!${NC}"

# Show database info
echo -e "${YELLOW}📊 Database Information:${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"