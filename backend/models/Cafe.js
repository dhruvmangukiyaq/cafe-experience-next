const mongoose = require('mongoose');

// Cafe schema — tracks real-life cafe experience data
const cafeSchema = new mongoose.Schema(
  {
    // Basic place info
    name: {
      type: String,
      required: [true, 'Cafe name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },

    // Food served, e.g. ["Coffee", "Sandwich", "Pastry"]
    foodSpecialties: {
      type: [String],
      default: [],
    },

    // Environment / ambience object
    environment: {
      noiseLevel: {
        type: String,
        enum: ['quiet', 'normal', 'loud'],
        default: 'normal',
      },
      seatingType: {
        type: String,
        enum: ['sofa', 'chairs', 'mixed'],
        default: 'mixed',
      },
      wifiSpeed: {
        type: String,
        enum: ['slow', 'medium', 'fast'],
        default: 'medium',
      },
      hasAC: { type: Boolean, default: true },
      hasOutdoorSeating: { type: Boolean, default: false },
    },

    // Approx cost per person
    avgPricePerPerson: {
      type: Number,
      min: 0,
    },

    // 1-5 wifi rating
    wifiQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    powerPlugsAvailable: { type: Boolean, default: false },

    // e.g. ["work-friendly", "date", "friends", "family"]
    ambienceTags: {
      type: [String],
      default: [],
    },

    // -10 to 10 scale, chosen from a dropdown in the UI
    rating: {
      type: Number,
      min: -10,
      max: 10,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },

    // Soft-delete flag (we never hard-delete)
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

module.exports = mongoose.model('Cafe', cafeSchema);
