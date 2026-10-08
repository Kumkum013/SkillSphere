const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

// Compound indexes for fast invitation lookup and preventing duplicates
invitationSchema.index({ studentId: 1, status: 1 });
invitationSchema.index({ projectId: 1, studentId: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);