const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000','https://smart-travel-platform.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ===== HELPER FUNCTIONS =====

// ✅ Normalize date to YYYY-MM-DD without timezone issues
function normalizeDate(dateString) {
  if (!dateString) return null;
  
  // If it's already a Date object
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's string in YYYY-MM-DD format
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Try to parse any other format
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

// ✅ Password validation
function validatePassword(password) {
  const errors = [];
  if (password.length < 6) errors.push('at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character (!@#$%^&* etc.)');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Get available slots with normalized dates
function getAvailableSlots(date) {
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const normalizedDate = normalizeDate(date);
  
  const bookedSlots = database.bookings
    .filter(b => normalizeDate(b.meetingDate) === normalizedDate && b.status !== 'cancelled')
    .map(b => b.meetingTime);
  
  return allSlots.filter(slot => !bookedSlots.includes(slot));
}

// ===== EMAIL SETUP =====

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "8e41599c8d03b3",
    pass: "a083027aaf286c"
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sureen130@gmail.com';

// ===== GEMINI SETUP =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ===== DATABASE SETUP =====
const database = {
  users: [],
  consultationRequests: [],
  travelPackages: [],
  bookings: [],
  emailVerifications: [],
  savedRecommendations: []
};

// ===== SEED TRAVEL PACKAGES =====
const seedTravelPackages = () => {
  const packages = [
    { id: 1, name: "Paris Romantic Escape", country: "France", city: "Paris", price: 1800, duration: 5, type: "relaxation", season: "spring,summer", highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"] },
    { id: 2, name: "Budget Barcelona Beach", country: "Spain", city: "Barcelona", price: 850, duration: 4, type: "relaxation", season: "summer", highlights: ["La Sagrada Familia", "Beach time", "Tapas bars"] },
    { id: 3, name: "Swiss Alps Adventure", country: "Switzerland", city: "Interlaken", price: 2200, duration: 6, type: "adventure", season: "winter,summer", highlights: ["Hiking", "Mountain biking", "Paragliding"] },
    { id: 4, name: "Tokyo Shopping Paradise", country: "Japan", city: "Tokyo", price: 1600, duration: 5, type: "shopping", season: "spring,autumn", highlights: ["Shibuya shopping", "Ginza district", "Akihabara"] },
    { id: 5, name: "Family Disney Florida", country: "USA", city: "Orlando", price: 2500, duration: 7, type: "family", season: "winter,spring", highlights: ["Disney World", "Universal Studios", "Water parks"] },
    { id: 6, name: "Budget Thailand Adventure", country: "Thailand", city: "Bangkok", price: 700, duration: 8, type: "adventure", season: "winter", highlights: ["Tuk-tuk rides", "Street markets", "Temple tours"] },
    { id: 7, name: "Luxury Dubai Escape", country: "UAE", city: "Dubai", price: 3500, duration: 5, type: "luxury", season: "winter,spring", highlights: ["Burj Khalifa", "Desert safari", "Luxury spa"] },
    { id: 8, name: "Greek Islands Relaxation", country: "Greece", city: "Santorini", price: 1500, duration: 5, type: "relaxation", season: "summer", highlights: ["Sunset viewing", "Blue domed churches", "Wine tasting"] },
    { id: 9, name: "New York City Explorer", country: "USA", city: "New York", price: 1200, duration: 4, type: "shopping", season: "autumn,spring", highlights: ["Times Square", "Broadway shows", "Fifth Avenue"] },
    { id: 10, name: "Costa Rica Adventure", country: "Costa Rica", city: "San José", price: 1100, duration: 6, type: "adventure", season: "winter,spring", highlights: ["Rainforest hiking", "Zip-lining", "Wildlife spotting"] }
  ];
  
  for (let i = 11; i <= 50; i++) {
    packages.push({
      id: i,
      name: `Travel Package ${i}`,
      country: i % 2 === 0 ? "Italy" : "Spain",
      city: i % 2 === 0 ? "Rome" : "Madrid",
      price: 500 + (i * 15),
      duration: 5 + (i % 5),
      type: i % 3 === 0 ? "relaxation" : i % 3 === 1 ? "adventure" : "luxury",
      season: "spring,summer",
      highlights: ["Beautiful scenery", "Local cuisine", "Cultural experiences"]
    });
  }
  
  database.travelPackages = packages;
  console.log(`✅ Seeded ${database.travelPackages.length} packages`);
};

// ===== AUTH HELPERS =====
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = user.userId;
    next();
  });
};

// ===== EMAIL FUNCTIONS =====
async function sendVerificationEmail(email, verificationCode, name) {
  const mailOptions = {
    from: `"Smart Travel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Smart Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Welcome to Smart Travel! ✈️</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering! Please use the verification code below to complete your registration:</p>
        
        <div style="background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 36px; letter-spacing: 8px;">${verificationCode}</h2>
        </div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        
        <hr>
        <small>If you didn't create an account, please ignore this email.</small>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendAdminNotification(bookingDetails) {
  const mailOptions = {
    from: `"Smart Travel" <${process.env.EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: '🔔 New Booking Request - Smart Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #667eea;">New Booking Request</h2>
        <hr>
        <p><strong>🆔 Booking ID:</strong> ${bookingDetails.id}</p>
        <p><strong>👤 Customer Name:</strong> ${bookingDetails.travelerName}</p>
        <p><strong>📧 Email:</strong> ${bookingDetails.email}</p>
        <p><strong>📞 Phone:</strong> ${bookingDetails.phone}</p>
        <p><strong>✈️ Package:</strong> ${bookingDetails.packageName || 'Custom Package'}</p>
        <p><strong>💰 Price:</strong> $${bookingDetails.packagePrice || bookingDetails.customPackage?.estimatedPrice || 'TBD'}</p>
        <p><strong>👥 Travelers:</strong> ${bookingDetails.travelers || 1}</p>
        <p><strong>📅 Meeting Date:</strong> ${bookingDetails.meetingDate}</p>
        <p><strong>⏰ Meeting Time:</strong> ${bookingDetails.meetingTime}</p>
        <p><strong>💬 Special Requests:</strong> ${bookingDetails.specialRequests || 'None'}</p>
        <hr>
        <small>Sent from Smart Travel Platform</small>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// ===== GEMINI AI FUNCTIONS =====
async function getAITravelAdvice(userQuery) {
  const prompt = `
    You are a smart travel expert. Answer concisely and in an organized way.
    
    User question: "${userQuery}"
    
    Format your response like this (use simple markdown formatting):
    
    **Brief Answer:** (1-2 sentences)
    
    **Key Points:**
    • Point 1
    • Point 2
    • Point 3
    
    **Tips:** (1-2 practical tips)
    
    Keep it under 300 words. Be helpful and specific.
  `;
  
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

async function generateStructuredRecommendation(preferences) {
  const prompt = `
    Based on these travel preferences:
    Budget: $${preferences.budget}
    Travel Type: ${preferences.travelType}
    Duration: ${preferences.duration} days
    Travelers: ${preferences.travelers}
    
    Recommend ONE specific destination and package.
    
    Format your response EXACTLY like this:
    
    🎯 **Recommended Destination:** [City, Country]
    
    📍 **Best For:** [1 sentence why it matches their preferences]
    
    ✨ **Highlights:**
    • [Activity 1]
    • [Activity 2]
    • [Activity 3]
    
    💰 **Estimated Cost:** $[amount] per person
    
    ⭐ **Why this match:** [1-2 sentences]
    
    Keep it concise and actionable.
  `;
  
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

// ===== API ENDPOINTS =====

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: `Password must contain: ${passwordValidation.errors.join(', ')}`
      });
    }
    
    // Check if user exists
    if (database.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser = { 
      id: Date.now().toString(), 
      name, 
      email, 
      password: hashedPassword, 
      saved_requests: [],
      isVerified: false,
      bookings: []
    };
    
    database.users.push(newUser);
    
    const verificationCode = generateVerificationCode();
    database.emailVerifications.push({
      userId: newUser.id,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await sendVerificationEmail(email, verificationCode, name);
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification code.',
      requiresVerification: true,
      email: email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit verification code' });
    }
    
    const verification = database.emailVerifications.find(v => v.code === code);
    if (!verification) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }
    
    if (new Date(verification.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    
    const user = database.users.find(u => u.id === verification.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isVerified = true;
    database.emailVerifications = database.emailVerifications.filter(v => v.code !== code);
    
    const jwtToken = generateToken(user.id);
    
    res.json({ 
      message: 'Email verified successfully! Welcome aboard!',
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    const user = database.users.find(u => u.email === email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
    
    database.emailVerifications = database.emailVerifications.filter(v => v.userId !== user.id);
    
    const newCode = generateVerificationCode();
    database.emailVerifications.push({
      userId: user.id,
      code: newCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await sendVerificationEmail(email, newCode, user.name);
    res.json({ message: 'New verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send code. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = database.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Email not found. Please register first.' });
    }
    
    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first. Check your inbox for the verification code.' });
    }
    
    const token = generateToken(user.id);
    res.json({ 
      message: 'Login successful! Welcome back!', 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = database.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// Packages endpoints
app.get('/api/packages', (req, res) => {
  res.json({ packages: database.travelPackages, count: database.travelPackages.length });
});

// Consultation endpoints
app.post('/api/consultation/match', (req, res) => {
  try {
    const { budget, travelType, duration } = req.body;
    let matches = database.travelPackages.filter(pkg => {
      if (pkg.price > parseInt(budget) * 1.1) return false;
      if (pkg.type !== travelType) return false;
      return true;
    });
    const recommended = matches[0] || database.travelPackages[0];
    res.json({ recommended_package: recommended, reason: `Perfect match based on your preferences!`, alternatives: matches.slice(1, 3), confidence_score: 95 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultation/save', authenticateToken, (req, res) => {
  const consultation = { id: Date.now().toString(), userId: req.userId, ...req.body, timestamp: new Date().toISOString() };
  database.consultationRequests.push(consultation);
  res.status(201).json({ message: 'Saved successfully', request: consultation });
});

app.get('/api/user/requests', authenticateToken, (req, res) => {
  const requests = database.consultationRequests.filter(r => r.userId === req.userId);
  res.json({ requests });
});

// AI endpoints
app.post('/api/ai/advice', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });
    
    const advice = await getAITravelAdvice(question);
    res.json({ advice });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
});

app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { preferences } = req.body;
    const recommendation = await generateStructuredRecommendation(preferences);
    res.json({ recommendation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/save-recommendation', authenticateToken, async (req, res) => {
  try {
    const { packageId, recommendationData } = req.body;
    
    const savedRecommendation = {
      id: 'REC' + Date.now(),
      userId: req.userId,
      packageId,
      recommendationData,
      savedAt: new Date().toISOString()
    };
    
    if (!database.savedRecommendations) database.savedRecommendations = [];
    database.savedRecommendations.push(savedRecommendation);
    
    res.json({ success: true, message: 'Recommendation saved!', saved: savedRecommendation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai/saved-recommendations', authenticateToken, (req, res) => {
  const saved = database.savedRecommendations?.filter(r => r.userId === req.userId) || [];
  res.json({ recommendations: saved });
});

// ===== BOOKING ENDPOINTS (FIXED WITH NORMALIZED DATES) =====

app.post('/api/bookings/create', authenticateToken, async (req, res) => {
  try {
    const { meetingDate, meetingTime, packageName, packagePrice, travelers, specialRequests } = req.body;
    const user = database.users.find(u => u.id === req.userId);
    
    const normalizedDate = normalizeDate(meetingDate);
    
    // Check if slot is already booked
    const existingBooking = database.bookings.find(b => 
      normalizeDate(b.meetingDate) === normalizedDate && 
      b.meetingTime === meetingTime && 
      b.status !== 'cancelled'
    );
    
    if (existingBooking) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please select another time.',
        availableSlots: getAvailableSlots(normalizedDate)
      });
    }
    
    const newBooking = {
      id: 'BK' + Date.now(),
      userId: req.userId,
      travelerName: user.name,
      email: user.email,
      phone: req.body.phone || user.phone || 'Not provided',
      meetingDate: normalizedDate,
      meetingTime,
      packageId: req.body.packageId || null,
      packageName: packageName || 'Travel Package',
      packagePrice: packagePrice || null,
      travelers: travelers || 1,
      specialRequests: specialRequests || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      source: 'packages_page'
    };
    
    database.bookings.push(newBooking);
    
    await sendAdminNotification(newBooking);
    
    res.status(201).json({ success: true, message: 'Booking request sent successfully! We will contact you within 24 hours.', booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
});

app.post('/api/bookings/direct', authenticateToken, async (req, res) => {
  try {
    const { message, meetingDate, meetingTime, packageId, packageName, packagePrice, travelers } = req.body;
    const user = database.users.find(u => u.id === req.userId);
    
    const normalizedDate = normalizeDate(meetingDate);
    
    // Check if slot is available
    const existingBooking = database.bookings.find(b => 
      normalizeDate(b.meetingDate) === normalizedDate && 
      b.meetingTime === meetingTime && 
      b.status !== 'cancelled'
    );
    
    if (existingBooking) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please select another time.',
        availableSlots: getAvailableSlots(normalizedDate)
      });
    }
    
    const newBooking = {
      id: 'DIR' + Date.now(),
      userId: req.userId,
      travelerName: user.name,
      email: user.email,
      phone: req.body.phone || user.phone || 'Not provided',
      meetingDate: normalizedDate,
      meetingTime,
      packageId: packageId || null,
      packageName: packageName || 'Custom Travel Consultation',
      packagePrice: packagePrice || null,
      travelers: travelers || 1,
      userRequest: message,
      specialRequests: message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      source: 'packages_page'
    };
    
    database.bookings.push(newBooking);
    
    await sendAdminNotification(newBooking);
    
    res.status(201).json({
      success: true,
      message: 'Your travel request has been submitted! We will contact you soon.',
      booking: newBooking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available slots - includes all non-cancelled bookings
app.get('/api/bookings/available-slots', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  
  const normalizedDate = normalizeDate(date);
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  // Get ALL booked slots (including those from packages page)
  const bookedSlots = database.bookings
    .filter(b => normalizeDate(b.meetingDate) === normalizedDate && b.status !== 'cancelled')
    .map(b => b.meetingTime);
  
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
  
  res.json({ 
    date: normalizedDate, 
    availableSlots, 
    bookedSlots,
    totalBookings: bookedSlots.length 
  });
});

// Get user's appointments
app.get('/api/user/appointments', authenticateToken, (req, res) => {
  const user = database.users.find(u => u.id === req.userId);
  
  const userBookings = database.bookings.filter(b => 
    (b.userId === req.userId || b.email === user?.email) && 
    b.status !== 'cancelled'
  );
  
  res.json({ appointments: userBookings });
});

// Get all appointments for schedule view (admin)
app.get('/api/appointments/all', authenticateToken, (req, res) => {
  const allBookings = database.bookings
    .filter(b => b.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = normalizeDate(a.meetingDate);
      const dateB = normalizeDate(b.meetingDate);
      if (dateA === dateB) return a.meetingTime.localeCompare(b.meetingTime);
      return dateA.localeCompare(dateB);
    });
  
  // Enrich with user names
  const enrichedBookings = allBookings.map(booking => {
    const user = database.users.find(u => u.id === booking.userId);
    return {
      ...booking,
      userName: user?.name || booking.travelerName || 'Unknown',
      userEmail: user?.email || booking.email
    };
  });
  
  res.json({ appointments: enrichedBookings });
});

// Get schedule for a specific date with full details
app.get('/api/schedule/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const normalizedDate = normalizeDate(date);
  
  const appointments = database.bookings
    .filter(b => normalizeDate(b.meetingDate) === normalizedDate && b.status !== 'cancelled')
    .map(booking => {
      const user = database.users.find(u => u.id === booking.userId);
      return {
        id: booking.id,
        time: booking.meetingTime,
        userName: user?.name || booking.travelerName,
        userEmail: user?.email || booking.email,
        packageName: booking.packageName,
        status: booking.status,
        specialRequests: booking.specialRequests || booking.userRequest,
        source: booking.source
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
  
  res.json({ 
    date: normalizedDate, 
    appointments,
    availableSlots: getAvailableSlots(normalizedDate)
  });
});

// Update appointment
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { meetingDate, meetingTime } = req.body;
    
    const booking = database.bookings.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    const oldDate = booking.meetingDate;
    const oldTime = booking.meetingTime;
    const normalizedNewDate = normalizeDate(meetingDate);
    
    // التحقق من توفر الوقت الجديد
    const existingSlot = database.bookings.find(b => 
      normalizeDate(b.meetingDate) === normalizedNewDate && 
      b.meetingTime === meetingTime && 
      b.status !== 'cancelled' &&
      b.id !== id
    );
    
    if (existingSlot) {
      return res.status(409).json({ 
        error: 'Time slot already taken. Please select another time.',
        availableSlots: getAvailableSlots(normalizedNewDate)
      });
    }
    
    booking.meetingDate = normalizedNewDate;
    booking.meetingTime = meetingTime;
    booking.updatedAt = new Date().toISOString();
    
    res.json({ 
      message: 'Appointment updated successfully!', 
      booking,
      releasedSlot: { date: oldDate, time: oldTime }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel appointment
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = database.bookings.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }
    
    const releasedSlot = { date: booking.meetingDate, time: booking.meetingTime };
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    
    res.json({ 
      message: 'Appointment cancelled successfully!', 
      releasedSlot,
      booking: { id: booking.id, status: booking.status }
    });
  } catch (error) {
    console.error('Error in cancel appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'API running',
    packages: database.travelPackages.length,
    users: database.users.length,
    bookings: database.bookings.length,
    verifiedUsers: database.users.filter(u => u.isVerified).length
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

seedTravelPackages();

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║   Smart Travel Platform - API Server                       ║
  ╚════════════════════════════════════════════════════════════╝
  
  🚀 Server: http://localhost:${PORT}
  📦 Packages: ${database.travelPackages.length}
  📅 Bookings: ${database.bookings.length}
  👥 Users: ${database.users.length}
  `);
});

module.exports = app;