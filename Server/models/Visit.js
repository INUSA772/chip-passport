// backend/src/models/Visit.js
//
// This model represents the VISIT entity from our ERD.
// One document = one hospital encounter for a patient.
// A patient can have MANY visits (one-to-many relationship),
// but only the most recent ones (up to visitCap) actually get
// encoded onto the QR/chip — see qrService.js for that logic later.

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    // Foreign Key linking back to Patient (matches ERD: Visit.nationalId FK)
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },

    // Foreign Key linking to the staff member who recorded this visit
    // (matches ERD: Visit.staffId FK)
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

    // Hardcoded scope for the prototype — QECH only, as agreed.
    // Kept as a field (not removed entirely) so scaling to multiple
    // hospitals later only means changing data, not the schema.
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