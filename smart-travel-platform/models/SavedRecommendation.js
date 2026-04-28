const mongoose = require('mongoose');

const savedRecommendationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: String,
  packageId: Number,
  recommendationData: String,
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRecommendation', savedRecommendationSchema);