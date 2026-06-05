const Student = require('../models/Student');
const Class = require('../models/Class');

// @desc    Get all students with pagination, filtering & sorting
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    let queryBuilder = Student.find().populate('class', 'name year');

    // Copy query
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    queryBuilder = queryBuilder.find(reqQuery);

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryBuilder = queryBuilder.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryBuilder = queryBuilder.sort(sortBy);
    } else {
      queryBuilder = queryBuilder.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Student.countDocuments(queryBuilder.getFilter());

    queryBuilder = queryBuilder.skip(startIndex).limit(limit);

    // Executing query
    const students = await queryBuilder;

    res.status(200).json({
      success: true,
      count: students.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const { name, gender, dob, phone, email, address, class: classId } = req.body;

    let targetClass = null;

    if (classId) {
      targetClass = await Class.findById(classId);
      if (!targetClass) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      // Check student limit
      if (targetClass.students.length >= targetClass.studentLimit) {
        return res.status(400).json({
          success: false,
          message: `Cannot add student. The class ${targetClass.name} has reached its limit of ${targetClass.studentLimit} students.`
        });
      }
    }

    const student = await Student.create({
      name,
      gender,
      dob,
      phone,
      email,
      address,
      class: classId || null
    });

    if (classId && targetClass) {
      // Add student reference to class
      targetClass.students.push(student._id);
      await targetClass.save();
    }

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { name, gender, dob, phone, email, address, class: newClassId } = req.body;

    const oldClassId = student.class ? student.class.toString() : null;
    const targetClassId = newClassId || null;

    if (oldClassId !== targetClassId) {
      // Check limit on new class
      if (targetClassId) {
        const targetClass = await Class.findById(targetClassId);
        if (!targetClass) {
          return res.status(404).json({ success: false, message: 'New class not found' });
        }

        if (targetClass.students.length >= targetClass.studentLimit) {
          return res.status(400).json({
            success: false,
            message: `Cannot move student. The class ${targetClass.name} has reached its limit of ${targetClass.studentLimit} students.`
          });
        }

        // Add to new class
        targetClass.students.push(student._id);
        await targetClass.save();
      }

      // Remove from old class
      if (oldClassId) {
        await Class.findByIdAndUpdate(oldClassId, {
          $pull: { students: student._id }
        });
      }
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, gender, dob, phone, email, address, class: targetClassId },
      { new: true, runValidators: true }
    ).populate('class');

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Pull student from class list
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: student._id }
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
