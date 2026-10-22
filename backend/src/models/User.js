const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
  password: { type: String },
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'ADMIN'], default: 'STUDENT' },
  branch: { type: String },
  year: { type: Number, min: 1, max: 5 },
  availability: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available',
    set: (v) => (v === true || v === 'true' || v === 'available' ? 'available' : 'busy')
  },
  skills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      name: String,
      level: { type: Number, min: 1, max: 5 },
      endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ],
  // GitHub Integration
  github: {
    id: { type: String, sparse: true },
    username: { type: String },
    accessToken: { type: String },
    profileUrl: { type: String },
    avatarUrl: { type: String }
  },
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Compound index for fast student search (role + year + branch)
userSchema.index({ role: 1, year: 1, branch: 1 });

// Multikey index for searching students by skill
userSchema.index({ 'skills.skillId': 1 });

// Index for sorting by recently registered students
userSchema.index({ role: 1, createdAt: -1 });

// Method to generate JWT token
userSchema.methods.generateToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, name: this.name, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
