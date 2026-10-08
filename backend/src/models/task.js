const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  requiredSkill: { type: String, default: '' },
  deadline: { type: Date },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'], default: 'TODO' },
  completedAt: { type: Date }
}, { timestamps: true });

// Indexes for fast project task board and workload queries
taskSchema.index({ projectId: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);