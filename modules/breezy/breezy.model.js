// modules/breezy/breezy.model.js (Optional)
const mongoose = require('mongoose');

const breezyCandidateSchema = new mongoose.Schema({
  breezyId: {
    type: String,
    required: true,
    unique: true
  },
  positionId: {
    type: String,
    required: true
  },
  name: String,
  email: String,
  phone: String,
  location: String,
  summary: String,
  stage: String,
  rating: Number,
  sources: [String],
  tags: [String],
  links: [{
    url: String,
    description: String
  }],
  resumeUrl: String,
  coverLetterUrl: String,
  photoUrl: String,
  createdAt: Date,
  updatedAt: Date,
  // Custom fields
  syncedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

const breezyPositionSchema = new mongoose.Schema({
  breezyId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  description: String,
  state: String,
  type: String,
  experience: String,
  location: String,
  department: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  tags: [String],
  hiringTeam: [{
    userId: String,
    name: String,
    email: String
  }],
  customFields: mongoose.Schema.Types.Mixed,
  createdAt: Date,
  updatedAt: Date,
  // Custom fields
  syncedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const BreezyCandidate = mongoose.model('BreezyCandidate', breezyCandidateSchema);
const BreezyPosition = mongoose.model('BreezyPosition', breezyPositionSchema);

module.exports = {
  BreezyCandidate,
  BreezyPosition
};