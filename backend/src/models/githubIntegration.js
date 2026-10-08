const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  repositoryOwner: { type: String, required: true },
  repositoryName: { type: String, required: true },
  connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubUsername: { type: String, required: true },
  encryptedAccessToken: { type: String, required: true, select: false }
}, { timestamps: true });

module.exports = mongoose.model('GitHubIntegration', githubIntegrationSchema);
