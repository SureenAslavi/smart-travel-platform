[# 🌍 Smart Travel Consultation Platform

A complete full-stack web application that provides AI-powered travel package recommendations with user authentication, package browsing, and consultation management.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## 🎯 Features

### 🧠 AI-Powered Recommendations
- Smart matching algorithm based on budget, travel type, and duration
- Confidence scoring system (0-100%)
- Alternative suggestions for diverse options
- Clarifying question capability for improved accuracy

### 👥 User Authentication
- Secure user registration with bcrypt password hashing
- JWT-based session management
- Profile management and saved requests
- Optional login for package browsing

### 📦 100+ Travel Packages
- Curated packages across all continents
- Multiple price ranges (Budget, Mid-range, Luxury)
- 5 travel types (Relaxation, Adventure, Shopping, Family, Luxury)
- Rich package details with highlights

### 🔍 Advanced Search & Filtering
- Filter by country, travel type, price range
- Real-time search functionality
- Detailed package cards with expandable content
- Quick view of package information

### 💾 Consultation Management
- Save consultation requests (requires login)
- View consultation history
- Track preferences over time
- Quick access to previous recommendations

### 📱 Responsive Design
- Mobile-first approach
- Works on desktop, tablet, mobile
- Smooth animations and transitions
- Modern UI with gradient effects

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, CSS3, Responsive Design |
| **Backend** | Node.js, Express.js |
| **Database** | In-Memory (MongoDB/PostgreSQL ready) |
| **Authentication** | JWT, bcryptjs |
| **Deployment** | Docker-ready |

### System Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - Pages: Home, Browse, Consultation    │
│  - Components: Forms, Cards, Filters    │
│  - State Management: React Hooks        │
└──────────────────┬──────────────────────┘
                   │ REST API (HTTP)
┌──────────────────┴──────────────────────┐
│  Backend (Express.js)                   │
│  - Routes: Auth, Packages, Consultation │
│  - Middleware: JWT, CORS                │
│  - Business Logic: AI Matching Engine   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│  Database (In-Memory)                   │
│  - Users: 100+ accounts                 │
│  - Packages: 100 travel packages        │
│  - Requests: Consultation history       │
└─────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  id: String,
  name: String,
  email: String (unique),
  password: String (hashed),
  saved_requests: [String] // Request IDs
}
```

### Travel Packages Collection (100 packages)
```javascript
{
  id: Number (1-100),
  name: String,
  country: String,
  city: String,
  price: Number (USD),
  duration: Number (days),
  type: String (relaxation|adventure|shopping|family|luxury),
  highlights: [String] // 3-5 activities
}
```

### Consultation Requests Collection
```javascript
{
  id: String,
  userId: String (or null for anonymous),
  budget: String,
  travelType: String,
  duration: String,
  travelers: String,
  packageId: Number,
  timestamp: ISO String
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm or yarn
- Modern web browser

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/SureenAslavi/smart-travel-platform.git
cd smart-travel-platform
cd smart-travel-platform
```

**2. Install backend dependencies**
```bash
npm install
```

**3. Install frontend dependencies and run it**
```bash
cd .\smart-travel-frontend\
npm install
npm run dev
```

### ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**4. Run the backend**
```bash
node server.js
```



## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

### Package Endpoints

#### List Packages (Filterable)
```http
GET /packages?country=France&type=relaxation&minPrice=500&maxPrice=2000
```

#### Get Single Package
```http
GET /packages/:id
```

### Consultation Endpoints

#### Get AI Recommendations
```http
POST /consultation/match
Content-Type: application/json

{
  "budget": "1500",
  "travelType": "relaxation",
  "duration": "5",
  "travelers": "2"
}
```

#### Save Consultation
```http
POST /consultation/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "budget": "1500",
  "travelType": "relaxation",
  "duration": "5",
  "travelers": "2",
  "packageId": 1
}
```

#### Get User's Requests
```http
GET /user/requests
Authorization: Bearer {token}
```

---

## 🤖 AI Recommendation Algorithm

### Matching Priority
1. **Budget** (Critical) - Filters to within 10% of budget
2. **Travel Type** (High) - Must match user's preferred type
3. **Duration** (Medium) - ±3 days flexibility
4. **Price Proximity** - Sorts by closest to budget

### Confidence Scoring
- **95-100%**: Perfect match on all criteria
- **85-94%**: Good match with slight variance
- **75-84%**: Reasonable alternative

### Example Flow
```
Input: Budget $1500, Relaxation, 5 days

Filter: Budget ≤ $1650 → 45 packages
Filter: Type = "relaxation" → 28 packages
Filter: Duration 2-8 days → 18 packages
Sort: Price proximity → [Package 1, Package 2, Package 3]

Output:
- Recommended: Package 1 ($1800, 5 days)
- Alternative 1: Package 2 ($1500, 5 days)
- Alternative 2: Package 3 ($900, 6 days)
- Confidence: 95%
```


## 🔐 Security Features

### Implemented
- ✅ Bcryptjs password hashing
- ✅ JWT token-based authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling

### Production Recommendations
- Add request validation middleware
- Store secrets in environment variables
- Add logging and monitoring
- Enable CSRF protection
- Implement API key system

---

## 🧪 Testing

### Test API with curl

**Health Check**
```bash
curl http://localhost:5000/api/health
```

**Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

**Get Recommendations**
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "2000",
    "travelType": "adventure",
    "duration": "7",
    "travelers": "3"
  }'
```

**Browse Packages**
```bash
curl "http://localhost:5000/api/packages?type=luxury&minPrice=3000"
```

---

## 📦 100 Travel Packages Overview

### Distribution
- **Types**: Relaxation (35), Adventure (25), Shopping (10), Family (20), Luxury (10)
- **Prices**: Budget $500-1K (30), Mid-range $1-2.5K (45), Luxury $2.5K+ (25)
- **Regions**: Europe (30), Asia (25), Americas (20), Africa (10), Oceania (15)

### Featured Packages
- Paris Romantic Escape - $1800
- Swiss Alps Adventure - $2200
- Tokyo Shopping Paradise - $1600
- Luxury Dubai Escape - $3500
- Budget Thailand Adventure - $700
- Maldives Resort - $4200

---

## 🚢 Deployment

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]
```

### Heroku
```bash
heroku create smart-travel-api
git push heroku main
```

### Environment Variables
```
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=production
DATABASE_URL=mongodb://...
CORS_ORIGIN=https://yourdomain.com
```

---

## 🔄 Data Flow

### User Registration
```
User Input → API Call → Hash Password → Save User → Generate Token → Return Token
```

### Get Recommendations
```
User Preferences → API Call → Apply Filters → Sort Results → Calculate Score → Return Recommendations
```

### Save Consultation
```
Authenticated User → API Call → Store Request → Link to User → Return Confirmation
```


