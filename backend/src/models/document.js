const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'ARCHIVE', 'OTHER'],
    default: 'DOCUMENT'
  },
  category: {
    type: String,
    enum: ['REQUIREMENT', 'DESIGN', 'CODE', 'TESTING', 'DOCUMENTATION', 'DELIVERABLE', 'OTHER'],
    default: 'OTHER'
  },
  description: {
    type: String,
    trim: true
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes
documentSchema.index({ projectId: 1, createdAt: -1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ fileType: 1 });
documentSchema.index({ category: 1 });

module.exports = mongoose.model('Document', documentSchema);
