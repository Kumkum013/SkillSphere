const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_PROJECT',
      'UPDATE_PROJECT',
      'DELETE_PROJECT',
      'JOIN_PROJECT',
      'LEAVE_PROJECT',
      'CREATE_TASK',
      'UPDATE_TASK',
      'DELETE_TASK',
      'ADD_MEMBER',
      'REMOVE_MEMBER',
      'SEND_INVITATION',
      'ACCEPT_INVITATION',
      'REJECT_INVITATION',
      'START_TIMER',
      'STOP_TIMER',
      'ADD_MILESTONE',
      'UPDATE_MILESTONE',
      'DELETE_MILESTONE',
      'CREATE_CLIENT',
      'UPDATE_CLIENT',
      'DELETE_CLIENT',
      'GENERATE_INVOICE',
      'UPLOAD_DOCUMENT',
      'DELETE_DOCUMENT',
      'UPDATE_PROFILE',
      'CHANGE_PASSWORD'
    ]
  },
  entityType: {
    type: String,
    enum: ['PROJECT', 'TASK', 'USER', 'CLIENT', 'INVOICE', 'DOCUMENT', 'MILESTONE']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
