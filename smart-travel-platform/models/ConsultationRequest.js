const mongoose = require('mongoose');

const consultationRequestSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: String,
  budget: String,
  travelType: String,
  duration: String,
  travelers: String,
  packageId: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConsultationRequest', consultationRequestSchema);