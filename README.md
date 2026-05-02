# 🌍 Smart Travel Consultation Platform

A complete full-stack web application that provides AI-powered travel package recommendations with user authentication, package browsing, and consultation & booking management.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)

---

## 🎯 Features

### 🧠 AI-Powered Recommendations
- Google Gemini AI integration
- Smart travel advice endpoint
- Personalized recommendations based on user preferences
- Structured AI responses (destination, highlights, cost)
- Save AI recommendations for later

---

### 👥 User Authentication
- Secure registration with email verification (6-digit code)
- bcrypt password hashing with validation
- JWT-based session management
- Protected routes and user sessions

---

### 📦 Travel Packages
- 50+ pre-seeded travel packages
- Multiple price ranges (Budget, Mid-range, Luxury)
- Travel types (Relaxation, Adventure, Shopping, Family, Luxury)
- Rich package details with highlights

---

### 📅 Booking & Appointment System
- Book consultation meetings (date & time)
- Real-time slot availability checking
- Prevent double booking
- Reschedule and cancel appointments
- Admin email notifications on booking

---

### 💾 Consultation Management
- Save consultation requests (requires login)
- View consultation history
- Save AI recommendations
- Access previous bookings and preferences

---

### 📧 Email System
- Email verification during registration
- Resend verification code
- Admin notified on every booking
- Built with Nodemailer (Gmail SMTP)

---

### 📱 Responsive Design
- Mobile-first approach
- Works on desktop, tablet, mobile
- Smooth UI experience

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite |
| **Backend** | Node.js, Express.js |
| **AI** | Google Gemini API |
| **Authentication** | JWT, bcryptjs |
| **Email** | Nodemailer |
| **Database** | In-Memory (MongoDB/PostgreSQL ready) |

---

## 📊 Database Schema

### Users
```javascript
{
  id: String,
  name: String,
  email: String,
  password: String,
  isVerified: Boolean,
  bookings: []
}
```

### Travel Packages
```javascript
{
  id: Number,
  name: String,
  country: String,
  city: String,
  price: Number,
  duration: Number,
  type: String,
  highlights: [String]
}
```

### Bookings
```javascript
{
  id: String,
  userId: String,
  travelerName: String,
  email: String,
  meetingDate: String,
  meetingTime: String,
  packageName: String,
  travelers: Number,
  status: String
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm
- Gmail account
- Gemini API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/SureenAslavi/smart-travel-platform.git
cd smart-travel-platform
```

**2. Install backend**
```bash
npm install
```

**3. Run frontend**
```bash
cd smart-travel-frontend
npm install
npm run dev
```

### ⚙️ Environment Variables

```env
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=your_admin_email@gmail.com
```

**4. Run backend**
```bash
node server.js
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 🔐 Auth
- POST /auth/register
- POST /auth/verify-email
- POST /auth/login
- GET /auth/me

### 📦 Packages
- GET /packages

### 🤖 AI
- POST /ai/advice
- POST /ai/recommend
- POST /ai/save-recommendation
- GET /ai/saved-recommendations

### 📅 Bookings
- POST /bookings/create
- POST /bookings/direct
- GET /bookings/available-slots
- GET /user/appointments
- PUT /appointments/:id
- DELETE /appointments/:id

### 📊 System
- GET /health

---

## 🔐 Security Features

- bcrypt password hashing
- JWT authentication
- CORS configuration
- Input validation
- Error handling

---

## ⚠️ Notes

- Database is in-memory (resets on server restart)
- Gmail requires App Password
- Ready to upgrade to MongoDB

---

## 📌 Future Improvements

- MongoDB integration
- Payment system
- Admin dashboard
- Notifications system
- Multi-language support
