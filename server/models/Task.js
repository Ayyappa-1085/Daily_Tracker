const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ['DSA', 'Study', 'Project', 'Personal', 'Other'], default: 'Other' },
  topic: { type: String, trim: true, maxlength: 80 },
  estimatedMinutes: { type: Number, required: true, min: 1, max: 1440 },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  carriedOver: { type: Boolean, default: false },
  carriedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
}, { timestamps: true });

taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, date: 1, status: 1 });
module.exports = mongoose.model('Task', taskSchema);