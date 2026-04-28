const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

// Load models
const User = require('./models/User');
const Package = require('./models/Package');
const Booking = require('./models/Booking');
const ConsultationRequest = require('./models/ConsultationRequest');
const EmailVerification = require('./models/EmailVerification');
const SavedRecommendation = require('./models/SavedRecommendation');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ===== MONGODB CONNECTION =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// ===== HELPER FUNCTIONS =====

function normalizeDate(dateString) {
  if (!dateString) return null;
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
}

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

async function getAvailableSlots(date) {
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const normalizedDate = normalizeDate(date);
  
  const bookedSlots = await Booking.find({
    meetingDate: normalizedDate,
    status: { $ne: 'cancelled' }
  }).select('meetingTime');
  
  const bookedTimes = bookedSlots.map(b => b.meetingTime);
  return allSlots.filter(slot => !bookedTimes.includes(slot));
}

// ===== EMAIL SETUP =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sureen130@gmail.com';

// ===== GEMINI SETUP =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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
        <p><strong>💰 Price:</strong> $${bookingDetails.packagePrice || 'TBD'}</p>
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

// ===== SEED TRAVEL PACKAGES =====
const seedTravelPackages = async () => {
  const count = await Package.countDocuments();
  if (count > 0) {
    console.log(`📦 Packages already exist (${count} packages)`);
    return;
  }
  
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
  
  await Package.insertMany(packages);
  console.log(`✅ Seeded ${packages.length} packages to MongoDB`);
};

// ===== API ENDPOINTS =====

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: `Password must contain: ${passwordValidation.errors.join(', ')}`
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      isVerified: false
    });
    
    await newUser.save();
    
    const verificationCode = generateVerificationCode();
    const emailVerification = new EmailVerification({
      userId: newUser.id,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await emailVerification.save();
    
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
    
    const verification = await EmailVerification.findOne({ code });
    if (!verification) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }
    
    if (new Date(verification.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    
    const user = await User.findOne({ id: verification.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isVerified = true;
    await user.save();
    await EmailVerification.deleteOne({ code });
    
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
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
    
    await EmailVerification.deleteMany({ userId: user.id });
    
    const newCode = generateVerificationCode();
    const emailVerification = new EmailVerification({
      userId: user.id,
      code: newCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await emailVerification.save();
    
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
    
    const user = await User.findOne({ email });
    
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

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await User.findOne({ id: req.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// Packages endpoints
app.get('/api/packages', async (req, res) => {
  const packages = await Package.find().sort({ id: 1 });
  res.json({ packages, count: packages.length });
});

// Consultation endpoints
app.post('/api/consultation/match', async (req, res) => {
  try {
    const { budget, travelType, duration } = req.body;
    const packages = await Package.find({
      price: { $lte: parseInt(budget) * 1.1 },
      type: travelType
    });
    
    const recommended = packages[0] || await Package.findOne();
    res.json({ recommended_package: recommended, reason: `Perfect match based on your preferences!`, alternatives: packages.slice(1, 3), confidence_score: 95 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultation/save', authenticateToken, async (req, res) => {
  const consultation = new ConsultationRequest({
    id: Date.now().toString(),
    userId: req.userId,
    ...req.body,
    timestamp: new Date().toISOString()
  });
  await consultation.save();
  res.status(201).json({ message: 'Saved successfully', request: consultation });
});

app.get('/api/user/requests', authenticateToken, async (req, res) => {
  const requests = await ConsultationRequest.find({ userId: req.userId });
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
    
    const savedRecommendation = new SavedRecommendation({
      id: 'REC' + Date.now(),
      userId: req.userId,
      packageId,
      recommendationData,
      savedAt: new Date().toISOString()
    });
    
    await savedRecommendation.save();
    
    res.json({ success: true, message: 'Recommendation saved!', saved: savedRecommendation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai/saved-recommendations', authenticateToken, async (req, res) => {
  const saved = await SavedRecommendation.find({ userId: req.userId });
  res.json({ recommendations: saved });
});

// ===== BOOKING ENDPOINTS =====

app.post('/api/bookings/create', authenticateToken, async (req, res) => {
  try {
    const { meetingDate, meetingTime, packageName, packagePrice, travelers, specialRequests } = req.body;
    const user = await User.findOne({ id: req.userId });
    
    const normalizedDate = normalizeDate(meetingDate);
    
    const existingBooking = await Booking.findOne({
      meetingDate: normalizedDate,
      meetingTime: meetingTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingBooking) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please select another time.',
        availableSlots: await getAvailableSlots(normalizedDate)
      });
    }
    
    const newBooking = new Booking({
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
      source: 'packages_page'
    });
    
    await newBooking.save();
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
    const user = await User.findOne({ id: req.userId });
    
    const normalizedDate = normalizeDate(meetingDate);
    
    const existingBooking = await Booking.findOne({
      meetingDate: normalizedDate,
      meetingTime: meetingTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingBooking) {
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please select another time.',
        availableSlots: await getAvailableSlots(normalizedDate)
      });
    }
    
    const newBooking = new Booking({
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
      source: 'packages_page'
    });
    
    await newBooking.save();
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

app.get('/api/bookings/available-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  
  const normalizedDate = normalizeDate(date);
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const bookedSlots = await Booking.find({
    meetingDate: normalizedDate,
    status: { $ne: 'cancelled' }
  }).select('meetingTime');
  
  const bookedTimes = bookedSlots.map(b => b.meetingTime);
  const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
  
  res.json({ 
    date: normalizedDate, 
    availableSlots, 
    bookedSlots: bookedTimes,
    totalBookings: bookedTimes.length 
  });
});

app.get('/api/user/appointments', authenticateToken, async (req, res) => {
  const user = await User.findOne({ id: req.userId });
  
  const userBookings = await Booking.find({
    $or: [
      { userId: req.userId },
      { email: user?.email }
    ],
    status: { $ne: 'cancelled' }
  });
  
  res.json({ appointments: userBookings });
});

app.get('/api/appointments/all', authenticateToken, async (req, res) => {
  const allBookings = await Booking.find({ status: { $ne: 'cancelled' } })
    .sort({ meetingDate: 1, meetingTime: 1 });
  
  const enrichedBookings = await Promise.all(allBookings.map(async (booking) => {
    const user = await User.findOne({ id: booking.userId });
    return {
      ...booking.toObject(),
      userName: user?.name || booking.travelerName || 'Unknown',
      userEmail: user?.email || booking.email
    };
  }));
  
  res.json({ appointments: enrichedBookings });
});

app.get('/api/schedule/:date', authenticateToken, async (req, res) => {
  const { date } = req.params;
  const normalizedDate = normalizeDate(date);
  
  const bookings = await Booking.find({
    meetingDate: normalizedDate,
    status: { $ne: 'cancelled' }
  });
  
  const appointments = await Promise.all(bookings.map(async (booking) => {
    const user = await User.findOne({ id: booking.userId });
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
  }));
  
  appointments.sort((a, b) => a.time.localeCompare(b.time));
  
  res.json({ 
    date: normalizedDate, 
    appointments,
    availableSlots: await getAvailableSlots(normalizedDate)
  });
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingDate, meetingTime } = req.body;
    
    const booking = await Booking.findOne({ id });
    
    if (!booking) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    const oldDate = booking.meetingDate;
    const oldTime = booking.meetingTime;
    const normalizedNewDate = normalizeDate(meetingDate);
    
    const existingSlot = await Booking.findOne({
      meetingDate: normalizedNewDate,
      meetingTime: meetingTime,
      status: { $ne: 'cancelled' },
      id: { $ne: id }
    });
    
    if (existingSlot) {
      return res.status(409).json({ 
        error: 'Time slot already taken. Please select another time.',
        availableSlots: await getAvailableSlots(normalizedNewDate)
      });
    }
    
    booking.meetingDate = normalizedNewDate;
    booking.meetingTime = meetingTime;
    booking.updatedAt = new Date();
    await booking.save();
    
    res.json({ 
      message: 'Appointment updated successfully!', 
      booking,
      releasedSlot: { date: oldDate, time: oldTime }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({ id });
    
    if (!booking) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }
    
    const releasedSlot = { date: booking.meetingDate, time: booking.meetingTime };
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
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
app.get('/api/health', async (req, res) => {
  const packagesCount = await Package.countDocuments();
  const usersCount = await User.countDocuments();
  const bookingsCount = await Booking.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  
  res.json({
    status: 'API running',
    packages: packagesCount,
    users: usersCount,
    bookings: bookingsCount,
    verifiedUsers: verifiedUsers,
    database: 'MongoDB Connected'
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedTravelPackages();
  
  app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║   Smart Travel Platform - API Server (MongoDB)            ║
  ╚════════════════════════════════════════════════════════════╝
  
  🚀 Server: http://localhost:${PORT}
  📦 MongoDB: Connected
  `);
  });
};

startServer();

module.exports = app;