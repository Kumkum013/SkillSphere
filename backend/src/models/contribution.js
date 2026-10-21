const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  // GitHub Data
  repository: { type: String, required: true },
  githubUsername: { type: String, required: true },
  contributionType: {
    type: String,
    enum: ['COMMIT', 'PULL_REQUEST', 'ISSUE', 'CODE_REVIEW', 'MERGE'],
    required: true
  },
  // Contribution Details
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String }, // GitHub URL for the contribution
  issueNumber: { type: Number },
  pullRequestNumber: { type: Number },
  commitHash: { type: String },
  // Statistics
  linesAdded: { type: Number, default: 0 },
  linesDeleted: { type: Number, default: 0 },
  filesChanged: { type: Number, default: 0 },
  // Scoring
  contributionScore: { type: Number, default: 0 }, // Calculated based on contribution type and impact
  // Review & Approval
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  reviewComment: { type: String },
  // Timestamps
  githubCreatedAt: { type: Date },
  mergedAt: { type: Date },
  closedAt: { type: Date }
}, { timestamps: true });

// Indexes for fast queries
contributionSchema.index({ projectId: 1, userId: 1 });
contributionSchema.index({ projectId: 1, contributionType: 1 });
contributionSchema.index({ userId: 1, createdAt: -1 });
contributionSchema.index({ githubUsername: 1 });

// Calculate contribution score before saving
contributionSchema.pre('save', function(next) {
  if (this.isNew) {
    // Base scores for different contribution types
    const baseScores = {
      'COMMIT': 5,
      'PULL_REQUEST': 20,
      'ISSUE': 10,
      'CODE_REVIEW': 15,
      'MERGE': 25
    };

    let score = baseScores[this.contributionType] || 5;

    // Bonus for lines of code
    if (this.linesAdded > 0) {
      score += Math.min(this.linesAdded / 10, 20); // Max 20 bonus points
    }

    // Bonus for multiple files
    if (this.filesChanged > 1) {
      score += Math.min(this.filesChanged * 2, 10); // Max 10 bonus points
    }

    // Bonus for merged PRs
    if (this.contributionType === 'PULL_REQUEST' && this.mergedAt) {
      score += 10;
    }

    this.contributionScore = Math.round(score);
  }
  next();
});

module.exports = mongoose.model('Contribution', contributionSchema);
