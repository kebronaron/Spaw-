#!/bin/bash
# AWS App Runner Deployment Script for SPaW

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
IMAGE_BACKEND="spaw-backend:latest"
IMAGE_FRONTEND="spaw-frontend:latest"
SERVICE_NAME_BACKEND="spaw-backend"
SERVICE_NAME_FRONTEND="spaw-frontend"

echo -e "${YELLOW}=== SPaW AWS Deployment Script ===${NC}\n"

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI not found. Please install it first.${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker not found. Please install it first.${NC}"
        exit 1
    fi
    
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo -e "${RED}AWS_ACCOUNT_ID not set. Please export AWS_ACCOUNT_ID=your-account-id${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All prerequisites met${NC}\n"
}

# Authenticate Docker with ECR
authenticate_ecr() {
    echo "Authenticating Docker with ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    echo -e "${GREEN}✓ Docker authenticated${NC}\n"
}

# Build and push backend
deploy_backend() {
    echo "Building backend Docker image..."
    docker build -f Dockerfile.backend -t $IMAGE_BACKEND .
    
    echo "Tagging backend image for ECR..."
    docker tag $IMAGE_BACKEND $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_BACKEND
    
    echo "Pushing backend image to ECR..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_BACKEND
    echo -e "${GREEN}✓ Backend deployed${NC}\n"
}

# Build and push frontend
deploy_frontend() {
    echo "Building frontend Docker image..."
    docker build -f Dockerfile.frontend -t $IMAGE_FRONTEND .
    
    echo "Tagging frontend image for ECR..."
    docker tag $IMAGE_FRONTEND $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_FRONTEND
    
    echo "Pushing frontend image to ECR..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_FRONTEND
    echo -e "${GREEN}✓ Frontend deployed${NC}\n"
}

# Display next steps
show_next_steps() {
    echo -e "${YELLOW}=== Deployment Complete ===${NC}\n"
    echo "Next steps:"
    echo "1. Create RDS PostgreSQL database (if not exists)"
    echo "2. Create App Runner services via AWS Console:"
    echo "   - Backend: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_BACKEND"
    echo "   - Frontend: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_FRONTEND"
    echo "3. Initialize database schema"
    echo "4. Configure environment variables on App Runner services"
    echo "5. Test the deployment"
    echo -e "\n${GREEN}For detailed instructions, see AWS_DEPLOYMENT_GUIDE.md${NC}\n"
}

# Main execution
main() {
    check_prerequisites
    authenticate_ecr
    
    read -p "Deploy backend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_backend
    fi
    
    read -p "Deploy frontend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_frontend
    fi
    
    show_next_steps
}

main
