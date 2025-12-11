# Quick Start: AWS Deployment

## 1. Prepare Your AWS Account (5 minutes)

```bash
# Set your AWS account ID
export AWS_ACCOUNT_ID=YOUR_12_DIGIT_ACCOUNT_ID
export AWS_REGION=us-east-1

# Configure AWS CLI
aws configure
```

## 2. Create ECR Repositories (2 minutes)

```bash
aws ecr create-repository --repository-name spaw-backend --region us-east-1
aws ecr create-repository --repository-name spaw-frontend --region us-east-1
```

## 3. Build and Push Docker Images (10 minutes)

```bash
# Navigate to project root
cd C:\Projects\spaw

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -f Dockerfile.backend -t spaw-backend:latest .
docker tag spaw-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-backend:latest

# Build and push frontend
docker build -f Dockerfile.frontend -t spaw-frontend:latest .
docker tag spaw-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-frontend:latest
```

## 4. Create RDS PostgreSQL Database (10 minutes)

Via AWS Console:
1. RDS → Create Database
2. PostgreSQL latest version
3. Free tier template
4. Instance: db.t3.micro
5. DB name: spaw_db
6. Save master password!

**Get endpoint**: spaw-db.xxxxxx.us-east-1.rds.amazonaws.com

## 5. Create App Runner Services (15 minutes each)

### Backend Service
1. App Runner → Create Service
2. ECR → spaw-backend:latest
3. Service name: spaw-backend
4. Port: 4000
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@spaw-db.xxxxx.us-east-1.rds.amazonaws.com:5432/spaw_db
   JWT_ACCESS_SECRET=your-secret-key-change-this
   JWT_REFRESH_SECRET=your-refresh-secret-change-this
   NODE_ENV=production
   ```
6. Deploy

### Frontend Service
1. App Runner → Create Service
2. ECR → spaw-frontend:latest
3. Service name: spaw-frontend
4. Port: 80
5. Add environment variable:
   ```
   VITE_API_URL=https://spaw-backend-xxxxx.awsapprunner.com
   ```
6. Deploy

## 6. Initialize Database (5 minutes)

```bash
# Connect to database
psql -h spaw-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d spaw_db

# Run SQL from files:
# 1. Copy content from backend/src/models/userModel.sql
# 2. Copy content from backend/src/models/tasksModel.sql
# 3. Copy content from backend/src/models/addPasswordReset.sql
```

## 7. Test Your Deployment

- Frontend: https://spaw-frontend-xxxxx.awsapprunner.com
- Backend API: https://spaw-backend-xxxxx.awsapprunner.com/api/health

## Estimated Cost (Monthly)

- App Runner: ~$2-5 (2 services)
- RDS: ~$15-30 (if outside free tier)
- **Total**: ~$20-35/month

## Troubleshooting

**Backend won't connect to database**
- Check RDS security group allows port 5432
- Verify DATABASE_URL is correct
- Ensure database and tables are created

**Frontend can't reach backend**
- Update VITE_API_URL to correct backend URL
- Check CORS is enabled on backend
- Verify both services are deployed and healthy

**Images won't build**
- Ensure Docker is running
- Check file paths in Dockerfile
- Verify all dependencies are in package.json

## Next: Automate with GitHub Actions

Create `.github/workflows/deploy.yml` to auto-deploy on push:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: ./deploy.sh
```

---

**Total time to production**: ~1 hour ⏱️
