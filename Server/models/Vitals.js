const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    nationalId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Staff ID of the nurse who recorded it
    staffId: {
      type: String,
      required: true,
      trim: true,
    },

    // Reason the patient came today
    complaint: {
      type: String,
      trim: true,
      default: '',
    },

    temperature: { type: Number },        // °C
    systolic: { type: Number },           // blood pressure, top number
    diastolic: { type: Number },          // blood pressure, bottom number
    pulse: { type: Number },              // beats per minute
    respiratoryRate: { type: Number },    // breaths per minute
    oxygenSaturation: { type: Number },   // SpO2 %
    weight: { type: Number },             // kg

    // How urgent the patient is
    triageLevel: {
      type: String,
      required: true,
      enum: ['emergency', 'urgent', 'routine'],
      default: 'routine',
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    facility: {
      type: String,
      default: 'Queen Elizabeth Central Hospital',
    },
  },
  {
    timestamps: true, // gives createdAt, which is the time the vitals were taken
  }
);

module.exports = mongoose.model('Vitals', vitalsSchema);