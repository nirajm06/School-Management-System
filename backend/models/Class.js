const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please add the academic year']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  },
  studentLimit: {
    type: Number,
    required: [true, 'Please set a student limit'],
    default: 30
  },
  fees: {
    type: Number,
    required: [true, 'Please set student fees amount'],
    default: 0
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
