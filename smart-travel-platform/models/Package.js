const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  country: String,
  city: String,
  price: Number,
  duration: Number,
  type: String,
  season: String,
  highlights: [String]
});

module.exports = mongoose.model('Package', packageSchema);