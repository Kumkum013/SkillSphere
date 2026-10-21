const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['Frontend', 'Backend', 'Database', 'Design', 'DevOps', 'Other'], default: 'Other' }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);