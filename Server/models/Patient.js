// backend/Server/models/Patient.js
//
// This model represents the PATIENT entity from our ERD.
// Now includes baseline medical fields (allergies, chronic conditions,
// current medications) so a card can be generated automatically after
// each visit, instead of requiring manual re-entry every time.

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    nationalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    bloodType: {
      type: String,
      required: false,
      trim: true,
    },

    // Baseline medical info — set at registration, updated as needed.
    // These feed automatic card rewrites after each visit.
    allergies: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    chronicConditions: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    currentMedications: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);