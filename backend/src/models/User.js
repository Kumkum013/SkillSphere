const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
  password: { type: String, required: true },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'ADMIN'], default: 'STUDENT' },
  branch: { type: String },
  year: { type: Number },
  githubUsername: { type: String, trim: true, maxlength: 39, default: '' },
  availability: { type: String, enum: ['available', 'busy'], default: 'available' },
  skills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      name: String,
      level: { type: Number, min: 1, max: 5 },
      endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ]
}, { timestamps: true });

// Compound index for fast student search (role + year + branch)
userSchema.index({ role: 1, year: 1, branch: 1 });

// Multikey index for searching students by skill
userSchema.index({ 'skills.skillId': 1 });

// Index for sorting by recently registered students
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
