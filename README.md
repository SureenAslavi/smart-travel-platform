# 🌍 Smart Travel Consultation Platform

A complete full-stack web application that provides AI-powered travel package recommendations with user authentication, package browsing, and consultation management.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## 🎯 Features

### 🧠 AI-Powered Recommendations
- Gemini AI integration for intelligent travel advice
- Personalized destination recommendations
- Smart matching based on budget, travel type, and duration
- Real-time AI chat assistant

### 👥 User Authentication
- Secure user registration with email verification (6-digit code)
- bcrypt password hashing with validation
- JWT-based session management
- Profile management and saved consultations

### 📦 50+ Travel Packages
- Curated packages across multiple destinations
- Multiple price ranges (Budget to Luxury)
- 5 travel types (Relaxation, Adventure, Shopping, Family, Luxury)
- Rich package details with highlights

### 📅 Booking & Appointment System
- Schedule consultation meetings with date/time picker
- Real-time availability checking
- Automatic email notifications for admin
- Cancel and reschedule functionality
- Google Calendar-style month view

### 💾 Consultation Management
- Save AI recommendations
- View consultation history
- Track preferences over time
- Quick access to previous bookings

### 📱 Responsive Design
- Mobile-first approach
- Works on desktop, tablet, mobile
- Smooth animations and transitions

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, CSS3 |
| **Backend** | Node.js, Express.js |
| **AI Integration** | Google Gemini AI |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **Authentication** | JWT, bcryptjs |
| **Database** | In-Memory (MongoDB/PostgreSQL ready) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn
- Gmail account for email verification
- Google Gemini API key

### Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd smart-travel-platform
