# Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/kss_ngo

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Razorpay (for online donations)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=optional_webhook_secret

# Frontend base URL (for donation links)
FRONTEND_BASE_URL=http://localhost:5173
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

**Razorpay:** Add your Razorpay API keys from [dashboard.razorpay.com](https://dashboard.razorpay.com) to enable online donations. Without them, UPI/Cash/Bank donations still work.

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud instance
# Update MONGODB_URI in .env
```

### 4. Seed Initial Super Admin

Create the initial super admin user:

```bash
npm run seed:admin
```

This will create a super admin with:
- Email: `admin@kss.org`
- Mobile: `1234567890`
- Password: `Admin@123`

**⚠️ Change the password immediately after first login!**

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### 6. Test the API

Check if the server is running:

```bash
curl http://localhost:3000/health
```

You should get:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## API Testing

### Login Example

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kss.org",
    "password": "Admin@123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Super Admin",
      "email": "admin@kss.org",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the Access Token

Include the token in the Authorization header for protected routes:

```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   ├── env.js       # Environment variables
│   │   ├── roles.js     # User roles
│   │   └── permissions.js # Permission system
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic layer
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   ├── scripts/         # Utility scripts
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── uploads/             # File uploads directory
├── .env                 # Environment variables (create this)
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## Common Issues

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process using the port

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings

## Next Steps

1. Create additional users via API or seed scripts
2. Start adding members, donations, and events
3. Configure frontend to connect to this API
4. Set up production environment with proper security

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure proper logging
- [ ] Use process manager (PM2)
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Review and update rate limits


