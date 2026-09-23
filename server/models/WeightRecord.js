const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  weight: { type: Number, required: true, min: 0.1, max: 500 },
}, { timestamps: true });

weightRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
