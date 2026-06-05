const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const { register, login, getMe } = require('../controllers/authController');
const { getClasses, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { getAttendance, saveAttendance, getClassStats } = require('../controllers/attendanceController');
const { getFeePayments, createFeePayment, deleteFeePayment } = require('../controllers/feeController');
const { getDashboardKPIs, getClassGenderRatio, getFinanceAnalytics } = require('../controllers/analyticsController');

// Authentication Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Class Routes
router.route('/classes')
  .get(protect, getClasses)
  .post(protect, authorize('admin'), createClass);
router.route('/classes/:id')
  .get(protect, getClass)
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

// Teacher Routes
router.route('/teachers')
  .get(protect, getTeachers)
  .post(protect, authorize('admin'), createTeacher);
router.route('/teachers/:id')
  .get(protect, getTeacher)
  .put(protect, authorize('admin'), updateTeacher)
  .delete(protect, authorize('admin'), deleteTeacher);

// Student Routes
router.route('/students')
  .get(protect, getStudents)
  .post(protect, authorize('admin', 'teacher'), createStudent);
router.route('/students/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin', 'teacher'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

// Attendance Routes
router.route('/attendance')
  .get(protect, getAttendance)
  .post(protect, authorize('admin', 'teacher'), saveAttendance);
router.get('/attendance/stats/:classId', protect, getClassStats);

// Fee Payment Routes
router.route('/fees')
  .get(protect, getFeePayments)
  .post(protect, authorize('admin'), createFeePayment);
router.route('/fees/:id')
  .delete(protect, authorize('admin'), deleteFeePayment);

// Analytics Routes
router.get('/analytics/kpis', protect, getDashboardKPIs);
router.get('/analytics/class-gender/:classId', protect, getClassGenderRatio);
router.get('/analytics/finance', protect, getFinanceAnalytics);

module.exports = router;
