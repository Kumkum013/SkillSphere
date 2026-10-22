const mongoose = require('mongoose');

const projectTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['ACADEMIC', 'COMMERCIAL', 'INTERNAL'],
    required: true
  },
  category: {
    type: String,
    enum: ['WEB_DEVELOPMENT', 'MOBILE_APP', 'DATA_SCIENCE', 'AI_ML', 'CYBERSECURITY', 'CLOUD', 'DEVOPS', 'RESEARCH', 'OTHER'],
    required: true
  },
  defaultSkills: [
    {
      skillName: String,
      weight: { type: Number, default: 1 }
    }
  ],
  defaultMilestones: [
    {
      title: String,
      description: String,
      estimatedDays: Number
    }
  ],
  defaultBudget: {
    type: Number,
    default: 0
  },
  defaultBillingRate: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number, // in days
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectTemplate', projectTemplateSchema);
