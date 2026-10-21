const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredSkills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
      name: String,
      weight: { type: Number, default: 1 }
    }
  ],
  minMatchScore: { type: Number, default: 50, min: 0, max: 100 },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'COMPLETED'], default: 'OPEN' },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isFacultyApproved: { type: Boolean, default: false },
  // GitHub Integration
  githubRepo: {
    url: { type: String },
    owner: { type: String },
    repoName: { type: String },
    lastSyncedAt: { type: Date }
  }
}, { timestamps: true });

// Compound and single indexes for fast querying & matching
projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ 'requiredSkills.skillId': 1 });
projectSchema.index({ mentorId: 1 });

module.exports = mongoose.model('Project', projectSchema);