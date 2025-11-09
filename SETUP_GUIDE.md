# HealthHub MERN Stack - Complete Setup Guide

## Project Structure

\`\`\`
healthhub/
├── backend/                 # Express.js server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── config/             # Cloudinary config
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
├── frontend/               # React app
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── api/            # API client
│   │   ├── utils/          # Utilities
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite config
│   ├── tailwind.config.js  # Tailwind config
│   ├── package.json        # Frontend dependencies
│   └── .env                # Environment variables
└── README.md               # Project documentation
\`\`\`

## Prerequisites

- **Node.js**: v14 or higher
- **npm** or **yarn**
- **MongoDB**: Local or MongoDB Atlas cloud
- **Cloudinary Account**: For image storage (free tier available)
- **Git**: For version control

## Step-by-Step Setup

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Add your IP to whitelist

### 2. Setup Cloudinary

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 3. Backend Setup

\`\`\`bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthhub
JWT_SECRET=your_super_secret_jwt_key_change_this
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

# Start backend server
npm run dev
# Server runs on http://localhost:5000
\`\`\`

### 4. Frontend Setup

\`\`\`bash
# In new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start frontend development server
npm run dev
# App runs on http://localhost:3000
\`\`\`

### 5. Verify Installation

1. Open browser: http://localhost:3000
2. Test backend: http://localhost:5000/api/health
3. Create account and login
4. Try each feature

## Backend Dependencies

\`\`\`json
{
  "express": "^4.18.2",          // Web framework
  "mongoose": "^7.5.0",          // MongoDB ODM
  "bcryptjs": "^2.4.3",          // Password hashing
  "jsonwebtoken": "^9.1.0",      // JWT auth
  "dotenv": "^16.3.1",           // Environment variables
  "cors": "^2.8.5",              // Cross-origin requests
  "multer": "^1.4.5-lts.1",      // File upload
  "cloudinary": "^1.40.0",       // Image storage
  "axios": "^1.5.0"              // HTTP client
}
\`\`\`

## Frontend Dependencies

\`\`\`json
{
  "react": "^18.2.0",            // UI library
  "react-dom": "^18.2.0",        // React DOM
  "react-router-dom": "^6.15.0", // Routing
  "axios": "^1.5.0",             // HTTP client
  "lucide-react": "^0.292.0",    // Icons
  "tailwindcss": "^3.3.5",       // CSS framework
  "vite": "^5.0.2"               // Build tool
}
\`\`\`

## API Endpoints Reference

### Authentication
\`\`\`
POST /auth/register          - Register new user
POST /auth/login             - Login
GET  /auth/profile           - Get user profile (requires auth)
\`\`\`

### Health Records
\`\`\`
GET    /health-records       - Get all records
POST   /health-records       - Create new record
PUT    /health-records/:id   - Update record
DELETE /health-records/:id   - Delete record
\`\`\`

### Documents (with Cloudinary)
\`\`\`
POST   /documents/upload     - Upload document to Cloudinary
GET    /documents            - Get all documents
DELETE /documents/:id        - Delete document (and from Cloudinary)
\`\`\`

### Blood Banks
\`\`\`
POST   /blood-banks/register - Register blood bank
GET    /blood-banks          - Get all banks
GET    /blood-banks/search/:bloodType - Search by blood type
POST   /blood-banks/nearby   - Find nearby banks
PUT    /blood-banks/:id      - Update bank info
\`\`\`

### Care Plans
\`\`\`
POST   /care-plans           - Create care plan
GET    /care-plans           - Get user's care plans
PUT    /care-plans/:id       - Update care plan
DELETE /care-plans/:id       - Delete care plan
\`\`\`

## Environment Variables Explained

### Backend (.env)

- **PORT**: Server port (default 5000)
- **MONGODB_URI**: MongoDB connection string

- **JWT_SECRET**: Secret key for JWT tokens (use strong key in production)
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name
- **CLOUDINARY_API_KEY**: Your Cloudinary API key
- **CLOUDINARY_API_SECRET**: Your Cloudinary API secret

### Frontend (.env)

- **VITE_API_URL**: Backend API URL (http://localhost:5000/api for development)

## Features & How They Work

### 1. User Authentication
- Register with name, email, password, age, blood type
- Login with email and password
- JWT token stored in localStorage
- Token sent with each request

### 2. Health Records
- Create records: appointments, prescriptions, lab tests, diagnoses
- Store doctor name, hospital, description
- Edit and delete records
- All linked to user

### 3. Documents Management
- Upload medical documents
- Files stored on Cloudinary (free storage)
- URL saved in MongoDB
- View, download, delete documents

### 4. Blood Bank Finder
- Register blood banks
- Search by blood type (O+, A+, B+, AB+, etc.)
- Find nearby banks by location
- Store phone, email, address

### 5. Care Plans
- Create personalized care plans
- Track medications, diet, exercises, lifestyle changes
- Store medical condition and notes
- Update and manage plans

## Troubleshooting

### Backend Won't Start
\`\`\`
Error: Cannot find module 'express'
Solution: Run npm install in backend folder
\`\`\`

### Cannot Connect to MongoDB
\`\`\`
Error: MongoServerError: connection refused
Solution: 
1. Check MongoDB service is running
2. Verify MONGODB_URI in .env
3. Check MongoDB is listening on port 27017
\`\`\`

### Cloudinary Upload Fails
\`\`\`
Error: Invalid credentials
Solution:
1. Verify CLOUDINARY credentials in .env
2. Check API key isn't expired
3. Ensure folder 'healthhub-documents' exists
\`\`\`

### Frontend Can't Connect to Backend
\`\`\`
Error: Network Error / CORS error
Solution:
1. Check backend is running on port 5000
2. Verify VITE_API_URL in frontend .env
3. Check CORS middleware in backend
\`\`\`

### JWT Token Expired
\`\`\`
Error: Unauthorized
Solution: Login again to get new token
\`\`\`

## Development Tips

### Running Both Servers
\`\`\`bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
\`\`\`

### Testing API Endpoints
Use Postman or curl:
\`\`\`bash
# Test backend health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password"}'
\`\`\`

### Database Management
\`\`\`bash
# Connect to local MongoDB
mongosh

# List databases
show databases

# Use healthhub database
use healthhub

# List collections
show collections

# View documents
db.users.find()
db.healthrecords.find()
db.documents.find()
\`\`\`

## Production Deployment

### Backend (Heroku)
\`\`\`bash
# Install Heroku CLI
heroku create healthhub-api
heroku config:set PORT=5000
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_production_secret
# ... set other env vars
git push heroku main
\`\`\`

### Frontend (Vercel)
\`\`\`bash
# Install Vercel CLI
npm install -g vercel
vercel

# Set env variables in Vercel dashboard
VITE_API_URL=https://healthhub-api.herokuapp.com/api
\`\`\`

## Security Best Practices

1. Change JWT_SECRET in production
2. Use strong passwords
3. Enable HTTPS in production
4. Set secure CORS policies
5. Validate all inputs
6. Use environment variables for secrets
7. Keep dependencies updated
8. Enable Cloudinary security settings

## Additional Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [JWT Docs](https://jwt.io)
\`\`\`
