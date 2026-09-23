const mongoose = require('mongoose');

const mealRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  mealKey: { type: String, required: true },
  mealName: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

mealRecordSchema.index({ userId: 1, date: 1, mealKey: 1 }, { unique: true });
mealRecordSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('MealRecord', mealRecordSchema);
