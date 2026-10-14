const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // used to hash passwords, never store plain text

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

    role: {
      type: String,
      required: true,
      enum: ['records_clerk', 'nurse', 'clinician', 'dentist', 'it_admin'],
    },

    facility: {
      type: String,
      required: true,
      default: 'Queen Elizabeth Central Hospital',
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

staffUserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // password wasn't changed, nothing to do
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

staffUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('StaffUser', staffUserSchema);