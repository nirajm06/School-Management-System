const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Student = require('../models/Student');

// @desc    Get attendance record for a class on a specific date
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  const { classId, date } = req.query;

  if (!classId || !date) {
    return res.status(400).json({ success: false, message: 'Please specify classId and date (YYYY-MM-DD)' });
  }

  try {
    const targetDate = new Date(date);
    // Set hours to midnight to compare properly
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Find attendance sheet
    let attendance = await Attendance.findOne({
      class: classId,
      date: {
        $gte: targetDate,
        $lt: nextDay
      }
    }).populate('records.student', 'name');

    // If attendance doesn't exist, we generate a draft sheet with default 'Present'
    if (!attendance) {
      const cls = await Class.findById(classId).populate('students', 'name');
      if (!cls) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      const records = cls.students.map(student => ({
        student: {
          _id: student._id,
          name: student.name
        },
        status: 'Present'
      }));

      return res.status(200).json({
        success: true,
        isDraft: true,
        data: {
          class: classId,
          date: targetDate,
          records
        }
      });
    }

    res.status(200).json({
      success: true,
      isDraft: false,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save daily attendance record (Create or Update)
// @route   POST /api/attendance
// @access  Private
exports.saveAttendance = async (req, res) => {
  const { classId, date, records } = req.body;

  if (!classId || !date || !records) {
    return res.status(400).json({ success: false, message: 'Please specify classId, date, and records' });
  }

  try {
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Try to find existing record
    let attendance = await Attendance.findOne({
      class: classId,
      date: {
        $gte: targetDate,
        $lt: nextDay
      }
    });

    if (attendance) {
      // Update
      attendance.records = records.map(r => ({
        student: r.studentId || r.student._id || r.student,
        status: r.status
      }));
      await attendance.save();
    } else {
      // Create
      attendance = await Attendance.create({
        class: classId,
        date: targetDate,
        records: records.map(r => ({
          student: r.studentId || r.student._id || r.student,
          status: r.status
        }))
      });
    }

    const populated = await Attendance.findById(attendance._id).populate('records.student', 'name');

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance rate summary
// @route   GET /api/attendance/stats/:classId
// @access  Private
exports.getClassStats = async (req, res) => {
  try {
    const records = await Attendance.find({ class: req.params.classId });

    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          presentRate: 0,
          absentRate: 0,
          lateRate: 0,
          totalSheets: 0
        }
      });
    }

    let totalStudentsCount = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    records.forEach(sheet => {
      sheet.records.forEach(rec => {
        totalStudentsCount++;
        if (rec.status === 'Present') presentCount++;
        else if (rec.status === 'Absent') absentCount++;
        else if (rec.status === 'Late') lateCount++;
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        presentRate: totalStudentsCount > 0 ? Math.round((presentCount / totalStudentsCount) * 100) : 0,
        absentRate: totalStudentsCount > 0 ? Math.round((absentCount / totalStudentsCount) * 100) : 0,
        lateRate: totalStudentsCount > 0 ? Math.round((lateCount / totalStudentsCount) * 100) : 0,
        totalSheets: records.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
