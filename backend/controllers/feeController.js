const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');

// @desc    Get all fee payments (History) with pagination & sorting
// @route   GET /api/fees
// @access  Private
exports.getFeePayments = async (req, res) => {
  try {
    let queryBuilder = FeePayment.find().populate({
      path: 'student',
      select: 'name class',
      populate: {
        path: 'class',
        select: 'name'
      }
    });

    // Filtering & Searching
    if (req.query.search) {
      // Find matching students first
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchingStudents = await Student.find({ name: searchRegex }).select('_id');
      const studentIds = matchingStudents.map(s => s._id);

      queryBuilder = queryBuilder.find({ student: { $in: studentIds } });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryBuilder = queryBuilder.sort(sortBy);
    } else {
      queryBuilder = queryBuilder.sort('-date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await FeePayment.countDocuments(queryBuilder.getFilter());

    queryBuilder = queryBuilder.skip(startIndex).limit(limit);

    // Executing query
    const payments = await queryBuilder;

    res.status(200).json({
      success: true,
      count: payments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record new fee payment
// @route   POST /api/fees
// @access  Private/Admin
exports.createFeePayment = async (req, res) => {
  const { studentId, amount, paymentMethod, remarks, date } = req.body;

  if (!studentId || !amount) {
    return res.status(400).json({ success: false, message: 'Please provide studentId and amount' });
  }

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payment = await FeePayment.create({
      student: studentId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      remarks: remarks || '',
      date: date || new Date()
    });

    // Update student's total feesPaid variable
    student.feesPaid = (student.feesPaid || 0) + Number(amount);
    await student.save();

    const populated = await FeePayment.findById(payment._id).populate({
      path: 'student',
      select: 'name class',
      populate: {
        path: 'class',
        select: 'name'
      }
    });

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (revert) a fee payment
// @route   DELETE /api/fees/:id
// @access  Private/Admin
exports.deleteFeePayment = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Decrement from student's total feesPaid
    const student = await Student.findById(payment.student);
    if (student) {
      student.feesPaid = Math.max(0, (student.feesPaid || 0) - payment.amount);
      await student.save();
    }

    await FeePayment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment record reverted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
