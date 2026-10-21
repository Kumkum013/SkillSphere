const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

joinRequestSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
