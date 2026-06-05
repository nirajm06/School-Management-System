import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../utils/api';
import { Calendar, Save, Percent, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

const AttendanceManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState(null);

  // Fetch classes list
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/api/classes', { params: { limit: 100 } });
        if (res.data.success) {
          setClasses(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedClass(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch classes list:', err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch attendance records for selected class and date
  const fetchAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.get('/api/attendance', {
        params: { classId: selectedClass, date: selectedDate }
      });
      if (res.data.success) {
        setAttendanceRecords(res.data.data.records || []);
      }
      
      // Fetch stats
      const statsRes = await api.get(`/api/attendance/stats/${selectedClass}`);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setMessage({ text: 'Error fetching attendance details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(rec => {
        const id = rec.student._id || rec.student;
        if (id === studentId) {
          return { ...rec, status };
        }
        return rec;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        records: attendanceRecords.map(rec => ({
          studentId: rec.student._id || rec.student,
          status: rec.status
        }))
      };

      const res = await api.post('/api/attendance', payload);
      if (res.data.success) {
        setMessage({ text: 'Attendance records saved successfully!', type: 'success' });
        fetchAttendance();
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setMessage({ text: err.response?.data?.message || 'Failed to save attendance records.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title="Attendance Registry" />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Filters and Controls */}
        <section className="glass-panel rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 w-full max-w-xs">
            <label className="form-label font-medium">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full max-w-xs">
            <label className="form-label font-medium">Select Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </section>

        {/* Stats and Message Banner */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats && (
            <>
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Present Rate</span>
                  <h4 className="text-2xl font-bold font-display text-emerald-600 mt-1">{stats.presentRate}%</h4>
                </div>
                <Percent size={20} className="text-emerald-500" />
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Absent Rate</span>
                  <h4 className="text-2xl font-bold font-display text-rose-600 mt-1">{stats.absentRate}%</h4>
                </div>
                <Percent size={20} className="text-rose-500" />
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Late Rate</span>
                  <h4 className="text-2xl font-bold font-display text-amber-600 mt-1">{stats.lateRate}%</h4>
                </div>
                <Percent size={20} className="text-amber-500" />
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Days Recorded</span>
                  <h4 className="text-2xl font-bold font-display text-indigo-600 mt-1">{stats.totalSheets}</h4>
                </div>
                <Calendar size={20} className="text-indigo-500" />
              </div>
            </>
          )}
        </section>

        {/* Message Banner */}
        {message.text && (
          <div className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Attendance Listing Table */}
        <section className="glass-panel rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Roster Attendance Grid</h4>
            <button
              onClick={handleSave}
              disabled={loading || saving || attendanceRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Registry'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Status Action Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Retrieving records...</span>
                      </div>
                    </td>
                  </tr>
                ) : attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      No students registered in this class.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((rec, idx) => {
                    const studentId = rec.student._id || rec.student;
                    const studentName = rec.student.name || 'N/A';
                    return (
                      <tr key={studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                        <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{studentName}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(studentId, 'Present')}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(studentId, 'Late')}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                rec.status === 'Late'
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(studentId, 'Absent')}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                rec.status === 'Absent'
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/10'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AttendanceManagement;
