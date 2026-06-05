const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add teacher name'],
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
  email: {
    type: String,
    required: [true, 'Please specify email'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Please specify phone number']
  },
  address: {
    type: String,
    required: [true, 'Please specify address']
  },
  salary: {
    type: Number,
    required: [true, 'Please specify salary'],
    default: 0
  },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
