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

    // Physical MIFARE / RFID card unique ID (from RC522).
    // Optional until a card is linked. sparse allows many patients with no card.
    rfidUid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);