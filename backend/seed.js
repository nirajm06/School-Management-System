const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const FeePayment = require('./models/FeePayment');

dotenv.config();

const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

const seedData = async () => {
  try {
    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Class.deleteMany();
    await Teacher.deleteMany();
    await Student.deleteMany();
    await Attendance.deleteMany();
    await FeePayment.deleteMany();

    console.log('Database cleared.');

    // 1. Create Users
    console.log('Creating users...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@school.com',
      password: 'admin123', // auto-hashed by User model schema
      role: 'Admin'
    });

    const teacherUser = await User.create({
      username: 'teacher',
      email: 'teacher@school.com',
      password: 'teacher123',
      role: 'Teacher'
    });

    // 2. Create Teachers
    console.log('Creating teachers...');
    const teacher1 = await Teacher.create({
      name: 'Sarah Connor',
      gender: 'Female',
      dob: new Date('1985-05-15'),
      email: 'sarah.c@school.com',
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace, Springfield',
      salary: 4500,
      user: teacherUser._id
    });

    const teacher2 = await Teacher.create({
      name: 'John Doe',
      gender: 'Male',
      dob: new Date('1978-09-22'),
      email: 'john.d@school.com',
      phone: '+1 (555) 014-9821',
      address: '123 Fake Street, Sector 7G',
      salary: 5000
    });

    const teacher3 = await Teacher.create({
      name: 'Robert Oppenheimer',
      gender: 'Male',
      dob: new Date('1980-04-22'),
      email: 'oppy.r@school.com',
      phone: '+1 (555) 012-9854',
      address: 'Los Alamos Facility, New Mexico',
      salary: 6000
    });

    // 3. Create Classes
    console.log('Creating classes...');
    const classA = await Class.create({
      name: 'Grade 10 - Science',
      year: 2026,
      teacher: teacher1._id,
      studentLimit: 5, // Small limit to easily demo limit logic
      fees: 1500
    });

    const classB = await Class.create({
      name: 'Grade 11 - Math',
      year: 2026,
      teacher: teacher2._id,
      studentLimit: 10,
      fees: 2000
    });

    const classC = await Class.create({
      name: 'Grade 12 - Physics',
      year: 2026,
      teacher: teacher3._id,
      studentLimit: 10,
      fees: 2500
    });

    // Update teachers with class links
    teacher1.assignedClass = classA._id;
    await teacher1.save();
    teacher2.assignedClass = classB._id;
    await teacher2.save();
    teacher3.assignedClass = classC._id;
    await teacher3.save();

    // 4. Create Students
    console.log('Creating students...');
    const studentsData = [
      // Grade 10 Students
      { name: 'Alice Smith', gender: 'Female', dob: new Date('2011-03-12'), phone: '555-0101', email: 'alice@gmail.com', address: 'Block A, Apts 4', class: classA._id },
      { name: 'Bob Johnson', gender: 'Male', dob: new Date('2011-06-25'), phone: '555-0102', email: 'bob@gmail.com', address: 'Block B, Apts 2', class: classA._id },
      { name: 'Clara Oswald', gender: 'Female', dob: new Date('2011-11-02'), phone: '555-0103', email: 'clara@gmail.com', address: 'Block C, Apts 9', class: classA._id },
      { name: 'David Tennant', gender: 'Male', dob: new Date('2011-04-18'), phone: '555-0104', email: 'david@gmail.com', address: 'Tardis Ave, Lane 10', class: classA._id },

      // Grade 11 Students
      { name: 'Emma Watson', gender: 'Female', dob: new Date('2010-04-15'), phone: '555-0201', email: 'emma@gmail.com', address: 'Gryffindor Dorms', class: classB._id },
      { name: 'Frank Underwood', gender: 'Male', dob: new Date('2010-01-20'), phone: '555-0202', email: 'frank@gmail.com', address: 'DC Capitol Townhouse', class: classB._id },
      { name: 'Grace Hopper', gender: 'Female', dob: new Date('2010-12-09'), phone: '555-0203', email: 'grace@gmail.com', address: 'CompSci Bay Area', class: classB._id },
      
      // Grade 12 Students
      { name: 'Harry Potter', gender: 'Male', dob: new Date('2009-07-31'), phone: '555-0301', email: 'harry@gmail.com', address: '4 Privet Drive', class: classC._id },
      { name: 'Ian Malcolm', gender: 'Male', dob: new Date('2009-10-10'), phone: '555-0302', email: 'ian@gmail.com', address: 'Jurassic Park Isla Nublar', class: classC._id },
      { name: 'Jane Austen', gender: 'Female', dob: new Date('2009-12-16'), phone: '555-0303', email: 'jane@gmail.com', address: 'Hampshire Cottage', class: classC._id }
    ];

    const students = await Student.create(studentsData);

    // Update classes with their student lists
    classA.students = students.filter(s => s.class.toString() === classA._id.toString()).map(s => s._id);
    await classA.save();
    classB.students = students.filter(s => s.class.toString() === classB._id.toString()).map(s => s._id);
    await classB.save();
    classC.students = students.filter(s => s.class.toString() === classC._id.toString()).map(s => s._id);
    await classC.save();

    // 5. Create Fee Payments
    console.log('Recording payments...');
    const now = new Date();
    
    // Create payments distributed over the current year (to make finance graphs interesting)
    const year = now.getFullYear();
    const paymentsData = [
      // Payments in past months of current year
      { student: students[0]._id, amount: 1500, date: new Date(year, 0, 10), paymentMethod: 'Card', remarks: 'Jan Term Fees' },
      { student: students[1]._id, amount: 1500, date: new Date(year, 1, 12), paymentMethod: 'UPI', remarks: 'Feb Term Fees' },
      { student: students[2]._id, amount: 1500, date: new Date(year, 2, 14), paymentMethod: 'Cash', remarks: 'Mar Term Fees' },
      
      { student: students[4]._id, amount: 2000, date: new Date(year, 0, 15), paymentMethod: 'Bank Transfer', remarks: 'Jan Term Fees' },
      { student: students[5]._id, amount: 2000, date: new Date(year, 1, 16), paymentMethod: 'UPI', remarks: 'Feb Term Fees' },
      
      { student: students[7]._id, amount: 2500, date: new Date(year, 0, 20), paymentMethod: 'Card', remarks: 'Jan Term' },
      { student: students[8]._id, amount: 2500, date: new Date(year, 1, 20), paymentMethod: 'Card', remarks: 'Feb Term' },

      // Current month payments
      { student: students[0]._id, amount: 1500, date: new Date(year, now.getMonth(), 2), paymentMethod: 'Card', remarks: 'Current Month Fees' },
      { student: students[1]._id, amount: 1500, date: new Date(year, now.getMonth(), 5), paymentMethod: 'UPI', remarks: 'Current Month Fees' },
      { student: students[4]._id, amount: 2000, date: new Date(year, now.getMonth(), 4), paymentMethod: 'UPI', remarks: 'Current Month Fees' },
      { student: students[7]._id, amount: 2500, date: new Date(year, now.getMonth(), 7), paymentMethod: 'Bank Transfer', remarks: 'Current Month Fees' },
      { student: students[9]._id, amount: 2500, date: new Date(year, now.getMonth(), 8), paymentMethod: 'Cash', remarks: 'Current Month Fees' }
    ];

    const payments = await FeePayment.create(paymentsData);

    // Update students' total feesPaid
    for (const p of payments) {
      await Student.findByIdAndUpdate(p.student, {
        $inc: { feesPaid: p.amount }
      });
    }

    // 6. Create Daily Attendance Sheets (past 5 weekdays)
    console.log('Generating attendance records...');
    const weekdays = [];
    let dayCursor = new Date();
    
    while (weekdays.length < 5) {
      dayCursor.setDate(dayCursor.getDate() - 1);
      const day = dayCursor.getDay();
      if (day !== 0 && day !== 6) { // Skip weekends
        weekdays.push(new Date(dayCursor));
      }
    }

    for (const d of weekdays) {
      d.setUTCHours(0, 0, 0, 0);

      // Attendance for classA
      await Attendance.create({
        class: classA._id,
        date: d,
        records: classA.students.map((studentId, idx) => ({
          student: studentId,
          // Let's make some students absent/late to make stats realistic
          status: idx % 3 === 0 ? 'Late' : (idx === 1 ? 'Absent' : 'Present')
        }))
      });

      // Attendance for classB
      await Attendance.create({
        class: classB._id,
        date: d,
        records: classB.students.map((studentId, idx) => ({
          student: studentId,
          status: idx === 0 ? 'Absent' : 'Present'
        }))
      });

      // Attendance for classC
      await Attendance.create({
        class: classC._id,
        date: d,
        records: classC.students.map((studentId, idx) => ({
          student: studentId,
          status: idx === 1 ? 'Late' : 'Present'
        }))
      });
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
