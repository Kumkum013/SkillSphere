const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index for user todos
todoSchema.index({ userId: 1, completed: 1, createdAt: -1 });

module.exports = mongoose.model('Todo', todoSchema);