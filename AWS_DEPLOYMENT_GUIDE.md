# SPaW AWS App Runner Deployment Guide

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- Docker installed locally
- GitHub repository with your code (already done ✓)

## Architecture Overview
```
GitHub Repository
    ↓
Docker Images (ECR)
    ↓
AWS App Runner (Frontend & Backend)
    ↓
RDS PostgreSQL
```

## Step 1: Set Up AWS Resources

### 1.1 Create RDS PostgreSQL Database
```bash
# Via AWS Console:
1. Go to RDS → Databases → Create database
2. Choose PostgreSQL (latest version)
3. DB instance class: db.t3.micro (free tier eligible)
4. Allocated storage: 20 GB
5. DB instance identifier: spaw-db
6. Master username: postgres
7. Auto-generate password (save it!)
8. VPC: Select your default VPC
9. Public accessibility: Yes (for initial setup)
10. Database name: spaw_db
11. Create database

# Note the Endpoint (e.g., spaw-db.xxxxx.us-east-1.rds.amazonaws.com)
```

### 1.2 Create ECR Repository
```bash
# Create repositories for both services
aws ecr create-repository --repository-name spaw-backend --region us-east-1
aws ecr create-repository --repository-name spaw-frontend --region us-east-1
```

## Step 2: Build and Push Docker Images

### 2.1 Authenticate Docker with ECR
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Example: Replace YOUR_AWS_ACCOUNT_ID with your actual account ID
```

### 2.2 Build Backend Image
```bash
# Navigate to project root
cd C:\Projects\spaw

# Build image
docker build -f Dockerfile.backend -t spaw-backend:latest .

# Tag for ECR
docker tag spaw-backend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-backend:latest

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-backend:latest
```

### 2.3 Build Frontend Image
```bash
# Build image
docker build -f Dockerfile.frontend -t spaw-frontend:latest .

# Tag for ECR
docker tag spaw-frontend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-frontend:latest

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spaw-frontend:latest
```

## Step 3: Create App Runner Services

### 3.1 Create Backend App Runner Service
```bash
# Via AWS Console:
1. Go to App Runner → Services → Create service
2. Repository type: ECR
3. Select: spaw-backend repository
4. Image tag: latest
5. Service name: spaw-backend
6. Port: 4000
7. Environment variables:
   - DATABASE_URL: postgresql://postgres:PASSWORD@spaw-db.xxxxx.us-east-1.rds.amazonaws.com:5432/spaw_db
   - JWT_ACCESS_SECRET: your-secret-key-here
   - JWT_REFRESH_SECRET: your-refresh-secret-here
   - NODE_ENV: production
8. Create & deploy
```

### 3.2 Create Frontend App Runner Service
```bash
# Via AWS Console:
1. Go to App Runner → Services → Create service
2. Repository type: ECR
3. Select: spaw-frontend repository
4. Image tag: latest
5. Service name: spaw-frontend
6. Port: 80
7. Environment variables:
   - VITE_API_URL: https://spaw-backend-service-url.awsapprunner.com
8. Create & deploy
```

## Step 4: Update Frontend Configuration

Create/Update `.env` files for different environments:

### development/.env.local
```
VITE_API_URL=http://localhost:4000
```

### production/.env
```
VITE_API_URL=https://your-backend-app-runner-url.awsapprunner.com
```

## Step 5: Initialize Database

Once backend is deployed:

```bash
# Connect to RDS PostgreSQL (using psql or AWS console)
psql -h spaw-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d spaw_db

# Then run:
-- Copy and paste contents from your SQL files:
-- backend/src/models/userModel.sql
-- backend/src/models/tasksModel.sql
-- backend/src/models/addPasswordReset.sql
```

Or use the migration script:
```bash
# Set NODE_ENV and run migrations from backend
NODE_ENV=production node migrate-reset-password.js
```

## Step 6: Update App Runner Environment Variables

After getting your service URLs:

```bash
# For Frontend - update API URL:
aws apprunner update-service \
  --service-arn arn:aws:apprunner:REGION:ACCOUNT:service/spaw-frontend/XXXXX \
  --source-configuration EnvironmentVariables='VITE_API_URL=https://spaw-backend-xxxxx.awsapprunner.com'

# For Backend - update frontend origin for CORS:
aws apprunner update-service \
  --service-arn arn:aws:apprunner:REGION:ACCOUNT:service/spaw-backend/XXXXX \
  --source-configuration EnvironmentVariables='FRONTEND_URL=https://spaw-frontend-xxxxx.awsapprunner.com'
```

## Step 7: Configure CORS in Backend

Update `backend/src/server.js`:

```javascript
const cors = require('cors');

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## Step 8: Set Up Domain and HTTPS

```bash
# Option 1: Use AWS Route 53
1. Register domain or use existing
2. Create hosted zone
3. Add CNAME records pointing to App Runner services

# Option 2: Use custom domain on App Runner
1. Go to App Runner Service → Custom domains
2. Add your custom domain
3. Verify domain ownership
4. AWS automatically provides SSL/TLS certificate
```

## Monitoring & Logs

### View Logs
```bash
# Backend logs
aws apprunner list-services
aws logs get-log-events --log-group-name /aws/apprunner/spaw-backend --log-stream-name your-stream

# Frontend logs (Nginx)
# Check via App Runner console
```

### Set Up CloudWatch Alarms
```bash
# Via AWS Console:
1. CloudWatch → Alarms → Create alarm
2. Select metrics for CPU, Memory, HTTP errors
3. Set thresholds and notifications
```

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Verify RDS security group allows incoming connections
# Check DATABASE_URL environment variable
# Ensure database exists and is initialized
```

**2. Frontend Can't Reach Backend**
```bash
# Update VITE_API_URL to correct App Runner service URL
# Check CORS settings on backend
# Verify App Runner services are in same VPC or publicly accessible
```

**3. App Runner Service Won't Deploy**
```bash
# Check ECR image exists
# Verify IAM permissions
# Check App Runner logs in AWS Console
```

## Cost Estimation (Free Tier Eligible)

- **App Runner**: $1/month per service + compute
- **RDS PostgreSQL**: db.t3.micro free for 12 months
- **ECR**: $0.07 per GB stored
- **Data transfer**: First 1GB/month free

**Total estimate**: ~$2-5/month for production

## Security Best Practices

✅ **Do:**
- Use environment variables for secrets
- Enable HTTPS (App Runner does this automatically)
- Use IAM roles for database access
- Enable RDS encryption at rest
- Set up VPC security groups properly
- Use secrets manager for sensitive data

❌ **Don't:**
- Commit `.env` files (use .gitignore ✓)
- Use weak database passwords
- Allow public database access in production
- Keep default security group rules

## Deployment Checklist

- [ ] AWS Account created and configured
- [ ] RDS PostgreSQL database created
- [ ] ECR repositories created
- [ ] Docker images built and pushed
- [ ] App Runner services created
- [ ] Database initialized with schema
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Frontend API URL points to backend service
- [ ] SSL/HTTPS working
- [ ] Logs accessible and monitored
- [ ] Tested full user flow (register, login, tasks, reset password)

## Next Steps

1. **CI/CD Pipeline**: Set up GitHub Actions to auto-build and push Docker images on commit
2. **Database Backups**: Enable automatic RDS backups
3. **Auto-scaling**: Configure App Runner auto-scaling
4. **Custom Domain**: Point your domain to App Runner services
5. **Analytics**: Set up CloudWatch dashboards

---

**Need Help?**
- AWS App Runner Docs: https://docs.aws.amazon.com/apprunner/
- AWS RDS Docs: https://docs.aws.amazon.com/rds/
- Docker Docs: https://docs.docker.com/
