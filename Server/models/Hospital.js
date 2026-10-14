const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Shown on the login page as "Contact your IT admin"
    contactEmail: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    contactPhone: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    singleton: {
      type: String,
      default: 'main',
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);