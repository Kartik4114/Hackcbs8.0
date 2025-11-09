# HealthHub Deployment Guide

## Deploying Backend to Heroku

### Prerequisites
- Heroku account (https://www.heroku.com)
- Heroku CLI installed
- Git initialized

### Steps

\`\`\`bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create healthhub-backend

# 3. Add MongoDB Atlas
# Create cluster on MongoDB Atlas and get connection string

# 4. Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthhub
heroku config:set JWT_SECRET=your_production_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs --tail
\`\`\`

## Deploying Frontend to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- Vercel CLI installed

### Steps

\`\`\`bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Add environment variables in Vercel dashboard
# Set VITE_API_URL=https://your-backend.herokuapp.com/api
\`\`\`

## Deploying to AWS

### Backend (Elastic Beanstalk)
\`\`\`bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js healthhub-backend

# Create environment
eb create production

# Set environment variables
eb setenv MONGODB_URI=... JWT_SECRET=... etc

# Deploy
eb deploy
\`\`\`

### Frontend (S3 + CloudFront)
\`\`\`bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name

# Create CloudFront distribution
# Point to S3 bucket
\`\`\`

## Database Backup

\`\`\`bash
# Backup MongoDB Atlas
# Download from MongoDB Atlas dashboard

# Or use mongodump
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/healthhub"
\`\`\`
\`\`\`
