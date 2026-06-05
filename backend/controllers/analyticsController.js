const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const FeePayment = require('../models/FeePayment');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard metrics (KPIs)
// @route   GET /api/analytics/kpis
// @access  Private
exports.getDashboardKPIs = async (req, res) => {
  try {
    const classCount = await Class.countDocuments();
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();

    // Calculate monthly expense (sum of all teacher salaries)
    const teachers = await Teacher.find({});
    const monthlySalaryExpenses = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);

    // Calculate fees collected this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyFeesPayments = await FeePayment.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    const monthlyIncome = monthlyFeesPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate overall attendance rate
    const attendanceRecords = await Attendance.find({});
    let totalRecordsCount = 0;
    let presentCount = 0;

    attendanceRecords.forEach(sheet => {
      sheet.records.forEach(rec => {
        totalRecordsCount++;
        if (rec.status === 'Present' || rec.status === 'Late') {
          presentCount++;
        }
      });
    });

    const attendanceRate = totalRecordsCount > 0 
      ? Math.round((presentCount / totalRecordsCount) * 100) 
      : 100; // default 100% if no records yet

    res.status(200).json({
      success: true,
      data: {
        classCount,
        studentCount,
        teacherCount,
        monthlyIncome,
        monthlyExpenses: monthlySalaryExpenses,
        attendanceRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get class gender ratio
// @route   GET /api/analytics/class-gender/:classId
// @access  Private
exports.getClassGenderRatio = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId).populate('students', 'gender');
    
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;

    cls.students.forEach(student => {
      if (student.gender === 'Male') maleCount++;
      else if (student.gender === 'Female') femaleCount++;
      else otherCount++;
    });

    res.status(200).json({
      success: true,
      data: {
        className: cls.name,
        male: maleCount,
        female: femaleCount,
        other: otherCount,
        total: cls.students.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get finance analytics (Income vs Expenses)
// @route   GET /api/analytics/finance
// @access  Private
exports.getFinanceAnalytics = async (req, res) => {
  const { view, year, month } = req.query; 
  // view: 'monthly' or 'yearly'
  // year: number (e.g. 2026)
  // month: number (0-11, only for monthly view)

  const selectedYear = parseInt(year, 10) || new Date().getFullYear();
  const selectedMonth = month !== undefined ? parseInt(month, 10) : new Date().getMonth();

  try {
    // 1. Calculate monthly expense (teacher salaries sum) which is assumed constant
    const teachers = await Teacher.find({});
    const monthlySalaryExpenses = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);

    if (view === 'monthly') {
      // Monthly View: Days of the month
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const chartData = [];

      // Initialize days
      for (let d = 1; d <= daysInMonth; d++) {
        chartData.push({
          label: `Day ${d}`,
          income: 0,
          expense: Math.round(monthlySalaryExpenses / daysInMonth) // spread salary expense evenly across days
        });
      }

      // Query payments in this specific month
      const startOfTargetMonth = new Date(Date.UTC(selectedYear, selectedMonth, 1));
      const endOfTargetMonth = new Date(Date.UTC(selectedYear, selectedMonth + 1, 1));

      const payments = await FeePayment.find({
        date: {
          $gte: startOfTargetMonth,
          $lt: endOfTargetMonth
        }
      });

      payments.forEach(p => {
        const paymentDay = new Date(p.date).getUTCDate();
        if (paymentDay >= 1 && paymentDay <= daysInMonth) {
          chartData[paymentDay - 1].income += p.amount;
        }
      });

      return res.status(200).json({
        success: true,
        view: 'monthly',
        year: selectedYear,
        month: selectedMonth,
        data: chartData,
        summary: {
          totalIncome: payments.reduce((sum, p) => sum + p.amount, 0),
          totalExpense: monthlySalaryExpenses
        }
      });

    } else {
      // Yearly View: 12 Months of the year
      const monthsNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const chartData = monthsNames.map(m => ({
        label: m,
        income: 0,
        expense: monthlySalaryExpenses // monthly expense is teacher salaries
      }));

      // Query payments in this year
      const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
      const endOfYear = new Date(Date.UTC(selectedYear + 1, 0, 1));

      const payments = await FeePayment.find({
        date: {
          $gte: startOfYear,
          $lt: endOfYear
        }
      });

      payments.forEach(p => {
        const paymentMonth = new Date(p.date).getUTCMonth(); // 0-11
        if (paymentMonth >= 0 && paymentMonth <= 11) {
          chartData[paymentMonth].income += p.amount;
        }
      });

      return res.status(200).json({
        success: true,
        view: 'yearly',
        year: selectedYear,
        data: chartData,
        summary: {
          totalIncome: payments.reduce((sum, p) => sum + p.amount, 0),
          totalExpense: monthlySalaryExpenses * 12
        }
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
