// Server/models/Hospital.js
//
// Holds the hospital's name and its public IT-admin contact details,
// shown on the login page so staff can reach the admin if needed.
// The 'singleton' field is unique, so only one hospital record can
// ever exist per deployment — that's what closes the first-run
// setup race condition.

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