import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../utils/api';
import { exportClassPDF } from '../utils/pdfGenerator';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldAlert 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ClassAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genderRatio, setGenderRatio] = useState([]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/classes/${id}`);
        if (res.data.success) {
          setClassData(res.data.data);
          
          // Fetch gender stats
          const ratioRes = await api.get(`/api/analytics/class-gender/${id}`);
          if (ratioRes.data.success) {
            const data = ratioRes.data.data;
            const chartFormatted = [
              { name: 'Male Students', value: data.male, color: '#4f46e5' }, // Indigo 600
              { name: 'Female Students', value: data.female, color: '#ec4899' }, // Pink 500
              { name: 'Other Students', value: data.other, color: '#94a3b8' } // Slate 400
            ].filter(item => item.value > 0); // Hide zero counts
            
            setGenderRatio(chartFormatted);
          }
        }
      } catch (err) {
        console.error('Failed to load class analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pl-64 pt-20 flex items-center justify-center">
        <Sidebar />
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading class report...</span>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen pl-64 pt-20 flex flex-col items-center justify-center gap-4 text-center">
        <Sidebar />
        <ShieldAlert size={48} className="text-rose-500 animate-bounce" />
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-200">Class Record Not Found</h3>
        <button
          onClick={() => navigate('/classes')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          Return to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title={`Class Analytics: ${classData.name}`} />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Navigation & Action header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/classes')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft size={18} />
            <span className="font-semibold text-sm">Back to Classes</span>
          </button>

          <button
            onClick={() => exportClassPDF(classData)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 transition-all font-semibold text-sm dark:shadow-none"
          >
            <FileText size={18} />
            <span>Export Roster PDF</span>
          </button>
        </div>

        {/* Top Info Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Summary Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Session Overview</span>
              <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 mt-2">{classData.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Academic Year: {classData.year}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Total Enrolled</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{classData.students?.length} students</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Class Capacity Limit</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{classData.studentLimit} seats</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Monthly Tuition Fee</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${classData.fees}</p>
              </div>
            </div>
          </div>

          {/* Assigned Teacher Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Classroom Educator</span>
            
            {classData.teacher ? (
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {classData.teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{classData.teacher.name}</h4>
                    <span className="text-xs text-slate-400">Main Instructor</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-slate-400" />
                    <span className="truncate">{classData.teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-slate-400" />
                    <span>{classData.teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User size={16} className="text-slate-400" />
                    <span>Gender: {classData.teacher.gender}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full pb-6 text-slate-400">
                <p className="text-sm">No teacher assigned yet.</p>
              </div>
            )}
          </div>

          {/* Recharts Pie Chart Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 self-start font-display">Student Gender Ratio</h4>
            {genderRatio.length > 0 ? (
              <div className="w-full h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {genderRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(255,255,255,0.9)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <span>No student demographics</span>
              </div>
            )}
          </div>
        </section>

        {/* Student Roster Table Grid */}
        <section className="glass-panel rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Registered Students ({classData.students?.length || 0})</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">D.O.B.</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Fees Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {classData.students?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No students registered in this class.
                    </td>
                  </tr>
                ) : (
                  classData.students?.map((s, idx) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                      <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{s.name}</td>
                      <td className="px-6 py-4">{s.gender}</td>
                      <td className="px-6 py-4">{new Date(s.dob).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{s.phone}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold dark:text-emerald-400">${s.feesPaid}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ClassAnalytics;
