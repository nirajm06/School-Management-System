const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// @desc    Get all classes with pagination, filtering & sorting
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Finding resource
    let queryBuilder = Class.find(JSON.parse(queryStr)).populate('teacher', 'name email');

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryBuilder = queryBuilder.find({
        $or: [
          { name: searchRegex }
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
    const total = await Class.countDocuments(queryBuilder.getFilter());

    queryBuilder = queryBuilder.skip(startIndex).limit(limit);

    // Executing query
    const classes = await queryBuilder;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: classes.length,
      pagination,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacher')
      .populate({
        path: 'students',
        select: 'name gender dob phone email feesPaid'
      });

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({
      success: true,
      data: cls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    const { name, year, teacher, studentLimit, fees } = req.body;

    // Check if teacher is already assigned
    if (teacher) {
      const activeTeacher = await Teacher.findById(teacher);
      if (!activeTeacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }
    }

    const cls = await Class.create({
      name,
      year,
      teacher: teacher || null,
      studentLimit: studentLimit || 30,
      fees: fees || 0
    });

    // If teacher is assigned, update teacher's assignedClass
    if (teacher) {
      await Teacher.findByIdAndUpdate(teacher, { assignedClass: cls._id });
    }

    res.status(201).json({
      success: true,
      data: cls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res) => {
  try {
    let cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const { name, year, teacher, studentLimit, fees } = req.body;

    // Handle student limit checks if current students exceed new limit
    if (studentLimit && cls.students.length > studentLimit) {
      return res.status(400).json({
        success: false,
        message: `Cannot lower student limit to ${studentLimit} because the class currently has ${cls.students.length} students`
      });
    }

    // Check teacher assignment changes
    const oldTeacherId = cls.teacher ? cls.teacher.toString() : null;
    const newTeacherId = teacher || null;

    if (oldTeacherId !== newTeacherId) {
      // Clear old teacher
      if (oldTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, { assignedClass: null });
      }
      // Set new teacher
      if (newTeacherId) {
        const activeTeacher = await Teacher.findById(newTeacherId);
        if (!activeTeacher) {
          return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        await Teacher.findByIdAndUpdate(newTeacherId, { assignedClass: cls._id });
      }
    }

    cls = await Class.findByIdAndUpdate(
      req.params.id,
      { name, year, teacher: newTeacherId, studentLimit, fees },
      { new: true, runValidators: true }
    ).populate('teacher');

    res.status(200).json({
      success: true,
      data: cls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Clear class linkages on Teacher
    if (cls.teacher) {
      await Teacher.findByIdAndUpdate(cls.teacher, { assignedClass: null });
    }

    // Clear class linkages on Students
    if (cls.students && cls.students.length > 0) {
      await Student.updateMany(
        { _id: { $in: cls.students } },
        { class: null }
      );
    }

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
