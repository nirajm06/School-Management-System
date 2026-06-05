const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender'],
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date,
    required: [true, 'Please specify date of birth']
  },
  phone: {
    type: String,
    required: [true, 'Please specify contact phone']
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please specify address']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  feesPaid: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
