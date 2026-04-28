const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  userId: String,
  code: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);