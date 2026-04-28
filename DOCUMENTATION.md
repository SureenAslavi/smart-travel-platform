# Smart Travel Consultation Platform - Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Documentation](#api-documentation)
5. [Setup Instructions](#setup-instructions)
6. [Features](#features)
7. [AI Consultation System](#ai-consultation-system)

---

## System Overview

**Smart Travel Consultation Platform** is a full-stack web application that uses AI to provide personalized travel package recommendations. Users can:
- Browse 100+ curated travel packages
- Get AI-powered recommendations based on preferences
- Create accounts and save their consultation requests
- Filter packages by price, type, country, and more

### Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + CSS3
- **Authentication**: JWT-based
- **Database**: In-Memory (production: MongoDB/PostgreSQL)
- **AI Matching**: Rule-based recommendation engine

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React Browser)                   │
├─────────────────────────────────────────────────────────────┤
│  - Home Page                                                │
│  - Package Browsing                                         │
│  - Consultation Form                                        │
│  - User Profile & Saved Requests                            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express.js Server)                │
├─────────────────────────────────────────────────────────────┤
│  Authentication Middleware (JWT)                            │
│  ├─ Register                                                │
│  ├─ Login                                                   │
│  ├─ Get Current User                                        │
│                                                             │
│  Package Routes                                             │
│  ├─ GET /packages (with filters)                            │
│  ├─ GET /packages/:id                                       │
│                                                             │
│  Consultation Routes (AI Matching)                          │
│  ├─ POST /consultation/match                                │
│  ├─ POST /consultation/save                                 │
│  ├─ GET /user/requests                                      │
│                                                             │
│  AI Consultation Engine                                     │
│  ├─ Budget Matching Algorithm                               │
│  ├─ Type-Based Filtering                                    │
│  ├─ Duration Flexibility Check                              │
│  └─ Confidence Score Calculation                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            DATABASE (In-Memory Data Store)                  │
├─────────────────────────────────────────────────────────────┤
│  ├─ Users Collection (100+ accounts possible)               │
│  ├─ Travel Packages (100 packages - seeded)                 │
│  └─ Consultation Requests (user history)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Users Collection
```javascript
{
  id: "1234567890",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password_bcrypt",
  saved_requests: ["req_id_1", "req_id_2"]
}
```

### Travel Packages Collection (100 packages)
```javascript
{
  id: 1,
  name: "Paris Romantic Escape",
  country: "France",
  city: "Paris",
  price: 1800,          // in USD
  duration: 5,          // days
  type: "relaxation",   // or adventure, shopping, family, luxury
  highlights: ["Eiffel Tower", "Louvre", "Seine River Cruise"]
}
```

### Consultation Requests Collection
```javascript
{
  id: "req_timestamp",
  userId: "user_id_or_null",
  budget: "1500",
  travelType: "relaxation",
  duration: "5",
  travelers: "2",
  packageId: 1,
  timestamp: "2024-01-15T10:30:00Z"
}
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### 3. Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Package Routes

#### 1. Get All Packages (with filters)
```
GET /packages?country=France&type=relaxation&minPrice=500&maxPrice=2000

Query Parameters:
  - country (optional): Filter by country
  - type (optional): relaxation | adventure | shopping | family | luxury
  - minPrice (optional): Minimum price
  - maxPrice (optional): Maximum price
  - search (optional): Search by name/city/country

Response (200):
{
  "packages": [
    { ... },
    { ... }
  ],
  "count": 15
}
```

#### 2. Get Single Package
```
GET /packages/:id

Response (200):
{
  "package": {
    "id": 1,
    "name": "Paris Romantic Escape",
    ...
  }
}
```

### Consultation Routes

#### 1. AI Matching (Get Recommendations)
```
POST /consultation/match
Content-Type: application/json

Request:
{
  "budget": "1500",
  "travelType": "relaxation",
  "duration": "5",
  "travelers": "2"
}

Response (200):
{
  "user_questions": [],
  "recommended_package": {
    "id": 1,
    "name": "Paris Romantic Escape",
    "country": "France",
    "price": 1800,
    ...
  },
  "reason": "Perfect match: Paris Romantic Escape fits your budget...",
  "alternatives": [
    { ... },
    { ... }
  ],
  "saved_request_id": "req_timestamp",
  "confidence_score": 95
}
```

#### 2. Save Consultation
```
POST /consultation/save
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "budget": "1500",
  "travelType": "relaxation",
  "duration": "5",
  "travelers": "2",
  "packageId": 1
}

Response (201):
{
  "message": "Consultation saved successfully",
  "request": {
    "id": "req_timestamp",
    "userId": "user_id",
    ...
  }
}
```

#### 3. Get User's Saved Requests
```
GET /user/requests
Authorization: Bearer <token>

Response (200):
{
  "requests": [
    { ... },
    { ... }
  ]
}
```

### Health Check

```
GET /health

Response (200):
{
  "status": "API running",
  "packages": 100,
  "users": 5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Modern web browser

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
# or if you have the combined directory:
npm install express cors bcryptjs jsonwebtoken dotenv
```

2. **Create .env file** (optional)
```
PORT=5000
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

3. **Start the server**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Create React App**
```bash
npx create-react-app smart-travel-frontend
cd smart-travel-frontend
```

2. **Replace files**
- Copy `App.jsx` to `src/App.js`
- Copy `App.css` to `src/App.css`

3. **Set API base URL** (in App.jsx)
```javascript
const API_BASE = process.env.REACT_APP_API || 'http://localhost:5000/api';
```

4. **Start the frontend**
```bash
npm start
```

App will run on `http://localhost:3000`

### Full Stack Running

Terminal 1 (Backend):
```bash
cd backend
npm install
npm start
# Server: http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm start
# App: http://localhost:3000
```

---

## Features

### 1. User Authentication
- ✅ Register new accounts
- ✅ Login/Logout
- ✅ JWT-based session management
- ✅ Password hashing (bcrypt)

### 2. Package Browsing
- ✅ 100 curated travel packages
- ✅ Advanced filtering (country, type, price)
- ✅ Search functionality
- ✅ Detailed package information

### 3. AI Consultation System
- ✅ Personalized recommendations
- ✅ Budget-based matching
- ✅ Type preference filtering
- ✅ Duration flexibility check
- ✅ Confidence scoring
- ✅ Alternative suggestions

### 4. User Dashboard
- ✅ View profile
- ✅ Save consultation requests
- ✅ View consultation history
- ✅ Manage saved packages

### 5. Responsive Design
- ✅ Mobile-friendly UI
- ✅ Tablet optimization
- ✅ Desktop experience
- ✅ Modern CSS with animations

---

## AI Consultation System

### Matching Algorithm

The AI recommendation engine uses a priority-based matching system:

```
1. BUDGET FILTERING (Priority 1 - Critical)
   - Include packages within 10% budget tolerance
   - Sort by price proximity to user budget
   
2. TYPE MATCHING (Priority 2 - High)
   - Exact match on travel type
   - relaxation | adventure | shopping | family | luxury
   
3. DURATION FLEXIBILITY (Priority 3 - Medium)
   - Allow ±3 days variance from requested duration
   - Prefer exact duration match
   
4. CONFIDENCE SCORING (Output)
   - Score: 95-100 = Exact match
   - Score: 85-94 = Good match
   - Score: 75-84 = Reasonable alternative
```

### Recommendation Flow

```
User Input
  ↓
├─ Budget: $1500
├─ Type: relaxation
├─ Duration: 5 days
└─ Travelers: 2

          ↓ [AI Processing]
          
Filter Stage 1: Budget Match
  → Filter packages: price ≤ $1650 (10% overage allowed)
  → Result: 45 packages
  
Filter Stage 2: Type Match
  → Filter by type = "relaxation"
  → Result: 28 packages
  
Filter Stage 3: Duration Match
  → Filter duration: 2-8 days (±3 days)
  → Result: 18 packages
  
Sort Stage: Price Proximity
  → Sort by |package_price - user_budget|
  → Top result: #1 (Recommended)
  → Results #2-#3: (Alternatives)
  
Calculate Confidence Score
  → Exact match on all criteria = 95%
  
          ↓
Output
  ├─ Recommended Package
  ├─ Why it matches
  ├─ 2 Alternatives
  ├─ Confidence Score
  └─ Save Option
```

### Example Recommendation

```
User Preferences:
- Budget: $1500
- Type: relaxation
- Duration: 5 days
- Travelers: 2

Recommended: "Paris Romantic Escape" (#1)
- Price: $1800 (within 10% tolerance)
- Type: relaxation ✓
- Duration: 5 days ✓
- Confidence: 95%
- Reason: "Perfect match - fits budget, type, and duration"

Alternatives:
1. "Greek Islands Relaxation" ($1500) - Exact price match
2. "Budget Barcelona Beach" ($850) - Best price, great value
```

---

## 100 Travel Packages Overview

### Distribution by Type
- **Relaxation**: 35 packages
- **Adventure**: 25 packages
- **Shopping**: 10 packages
- **Family**: 20 packages
- **Luxury**: 10 packages

### Distribution by Price
- **Budget** ($500-$1000): 30 packages
- **Mid-range** ($1000-$2500): 45 packages
- **Luxury** ($2500+): 25 packages

### Geographic Coverage
- **Europe**: 30 packages
- **Asia**: 25 packages
- **Americas**: 20 packages
- **Africa**: 10 packages
- **Oceania**: 15 packages

---

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Invalid credentials"
}
```

---

## Security Considerations

### Implemented
- ✅ Password hashing (bcryptjs)
- ✅ JWT token-based auth
- ✅ CORS headers configured
- ✅ Input validation

### Production Recommendations
- 🔒 Use HTTPS/TLS
- 🔒 Implement rate limiting
- 🔒 Add request validation middleware
- 🔒 Use environment variables
- 🔒 Store secrets in .env
- 🔒 Implement database with proper security
- 🔒 Add logging and monitoring

---

## Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create smart-travel-api

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Using Vercel
npm install -g vercel
vercel

# Or build and deploy to Netlify
npm run build
# Upload dist folder to Netlify
```

---

## API Examples with curl

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "1500",
    "travelType": "relaxation",
    "duration": "5",
    "travelers": "2"
  }'
```

### Get Packages with Filter
```bash
curl "http://localhost:5000/api/packages?country=France&type=relaxation&maxPrice=2000"
```

---

## Support & Issues

For issues or questions:
1. Check the API health: `GET /api/health`
2. Verify token in Authorization header
3. Check console logs for detailed error messages
4. Review API documentation above

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Production Ready
