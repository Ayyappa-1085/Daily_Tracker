const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  type: { type: String, enum: ['volume', 'duration', 'time', 'count', 'boolean', 'range'], default: 'count' },
  active: { type: Boolean, default: true },
  target: { type: Number, required: true, min: 0 },
  targetMax: { type: Number, min: 0 },
  color: { type: String, default: '#2878ea' },
}, { timestamps: true });

habitSchema.index({ userId: 1, key: 1 }, { unique: true });
module.exports = mongoose.model('Habit', habitSchema);