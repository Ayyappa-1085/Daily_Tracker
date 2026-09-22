const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true },
  actualValue: { type: mongoose.Schema.Types.Mixed },
  value: { type: Number, min: 0 },
  secondaryValue: { type: Number, min: 0 },
}, { timestamps: true });

recordSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('HabitRecord', recordSchema);