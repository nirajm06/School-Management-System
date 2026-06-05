const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

// @desc    Get all teachers with pagination, filtering & sorting
// @route   GET /api/teachers
// @access  Private
exports.getTeachers = async (req, res) => {
  try {
    let queryBuilder = Teacher.find().populate('assignedClass', 'name year');

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
    const total = await Teacher.countDocuments(queryBuilder.getFilter());

    queryBuilder = queryBuilder.skip(startIndex).limit(limit);

    // Executing query
    const teachers = await queryBuilder;

    res.status(200).json({
      success: true,
      count: teachers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('assignedClass');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
  try {
    const { name, gender, dob, email, phone, address, salary, assignedClass } = req.body;

    // Check if email already exists
    const teacherExists = await Teacher.findOne({ email });
    if (teacherExists) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    const teacher = await Teacher.create({
      name,
      gender,
      dob,
      email,
      phone,
      address,
      salary: salary || 0,
      assignedClass: assignedClass || null
    });

    // Link assigned class back
    if (assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, { teacher: teacher._id });
    }

    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const { name, gender, dob, email, phone, address, salary, assignedClass } = req.body;

    const oldClassId = teacher.assignedClass ? teacher.assignedClass.toString() : null;
    const newClassId = assignedClass || null;

    if (oldClassId !== newClassId) {
      // Remove teacher from old class
      if (oldClassId) {
        await Class.findByIdAndUpdate(oldClassId, { teacher: null });
      }
      // Assign teacher to new class
      if (newClassId) {
        await Class.findByIdAndUpdate(newClassId, { teacher: teacher._id });
      }
    }

    teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, gender, dob, email, phone, address, salary, assignedClass: newClassId },
      { new: true, runValidators: true }
    ).populate('assignedClass');

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Clear reference in assigned class
    if (teacher.assignedClass) {
      await Class.findByIdAndUpdate(teacher.assignedClass, { teacher: null });
    }

    await Teacher.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
