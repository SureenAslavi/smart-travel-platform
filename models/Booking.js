const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: { type: String, ref: 'User' },
  travelerName: String,
  email: String,
  phone: String,
  meetingDate: String,
  meetingTime: String,
  packageId: { type: Number, default: null },
  packageName: String,
  packagePrice: Number,
  travelers: { type: Number, default: 1 },
  specialRequests: String,
  userRequest: String,
  status: { type: String, default: 'pending' },
  source: { type: String, default: 'packages_page' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  cancelledAt: Date
});

module.exports = mongoose.model('Booking', bookingSchema);