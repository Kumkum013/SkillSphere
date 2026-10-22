const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  isBillable: {
    type: Boolean,
    default: true
  },
  billableRate: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['RUNNING', 'COMPLETED', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    default: 'RUNNING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Indexes for efficient querying
timeEntrySchema.index({ userId: 1, startTime: -1 });
timeEntrySchema.index({ projectId: 1, startTime: -1 });
timeEntrySchema.index({ status: 1 });
timeEntrySchema.index({ startTime: -1 });

// Calculate duration before saving
timeEntrySchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000 / 60); // Duration in minutes
  }
  next();
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
