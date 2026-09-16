const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cafe name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  foodSpecialties: [{
    type: String,
    trim: true
  }],
  environment: {
    noiseLevel: {
      type: String,
      enum: ['quiet', 'normal', 'loud'],
      default: 'normal'
    },
    seatingType: {
      type: String,
      enum: ['sofa', 'chairs', 'mixed'],
      default: 'mixed'
    },
    hasAC: {
      type: Boolean,
      default: true
    },
    hasOutdoorSeating: {
      type: Boolean,
      default: false
    },
    wifiSpeed: {
      type: String,
      enum: ['slow', 'medium', 'fast'],
      default: 'medium'
    }
  },
  avgPricePerPerson: {
    type: Number,
    min: 0
  },
  wifiQuality: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  powerPlugsAvailable: {
    type: Boolean,
    default: false
  },
  ambienceTags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cafe', cafeSchema);