// backend/Server/models/StaffUser.js
//
// This model represents the STAFFUSER entity from our ERD.
// It's the clinician, nurse, or IT admin who logs in, scans cards,
// and records visits. This is also what authMiddleware.js will
// check against later, to enforce "only authorized staff can
// read/write patient data" from our ethics section.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // used to hash passwords — never store plain text

const staffUserSchema = new mongoose.Schema(
  {
    staffId: {
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

    // Matches your sampling groups from the proposal: clinicians,
    // nurses, and IT admins. Restricting to these three values
    // keeps roles predictable everywhere else in the code.
    role: {
      type: String,
      required: true,
      enum: ['clinician', 'nurse', 'it_admin'],
    },

    facility: {
      type: String,
      required: true,
      default: 'Queen Elizabeth Central Hospital',
    },

    // Stores the HASHED password, never the plain text version.
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// This runs automatically before a StaffUser is saved to the database.
// If the password field was changed, it gets hashed here — so
// controllers never have to remember to hash it themselves.
//
// NOTE: async functions and the old-style next() callback can't be
// mixed in Mongoose middleware — using async means just returning
// normally when done, not calling next().
staffUserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // password wasn't changed, nothing to do
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method: lets authController check a login attempt
// without needing to know HOW passwords are hashed.
staffUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('StaffUser', staffUserSchema);