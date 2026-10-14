const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    // Foreign Key linking back to Patient (matches ERD: Visit.nationalId FK)
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },

    
    staffId: {
      type: String,
      required: true,
      trim: true,
    },

    visitDate: {
      type: Date,
      required: true,
      default: Date.now, // defaults to "now" if not explicitly set
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    treatmentNotes: {
      type: String,
      required: false,
      trim: true,
    },

    facility: {
      type: String,
      required: true,
      default: 'Queen Elizabeth Central Hospital',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visit', visitSchema);