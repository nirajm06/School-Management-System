import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../utils/api';

import { 
  Users, 
  GraduationCap, 
  School, 
  IndianRupee, 
  CalendarCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get('/api/analytics/kpis');
        if (res.data.success) {
          setKpis(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load KPIs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  const cardItems = [
    {
      title: 'Total Students',
      value: kpis?.studentCount || 0,
      icon: GraduationCap,
      color: 'from-blue-600 to-blue-400',
      shadow: 'shadow-blue-500/10',
      link: '/students',
      roles: ['admin', 'teacher']
    },
    {
      title: 'Total Teachers',
      value: kpis?.teacherCount || 0,
      icon: Users,
      color: 'from-emerald-600 to-emerald-400',
      shadow: 'shadow-emerald-500/10',
      link: '/teachers',
      roles: ['admin']
    },
    {
      title: 'Total Classes',
      value: kpis?.classCount || 0,
      icon: School,
      color: 'from-purple-600 to-purple-400',
      shadow: 'shadow-purple-500/10',
      link: '/classes',
      roles: ['admin', 'teacher']
    },
    {
      title: 'Current Month Income',
      value: `₹${kpis?.monthlyIncome || 0}`,
      icon: IndianRupee,
      color: 'from-indigo-600 to-indigo-400',
      shadow: 'shadow-indigo-500/10',
      link: '/fees',
      roles: ['admin']
    },
    {
      title: 'Attendance Rate',
      value: `${kpis?.attendanceRate || 0}%`,
      icon: CalendarCheck,
      color: 'from-amber-600 to-amber-400',
      shadow: 'shadow-amber-500/10',
      link: '/attendance',
      roles: ['admin', 'teacher']
    }
  ];

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title="Dashboard" />

      <main className="p-8 flex flex-col gap-8">
        
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white via-indigo-900 to-indigo-900 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
            <h1 className="text-3xl font-bold font-display">Hello, {user?.username}!</h1>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Welcome back to your administration dashboard. Access management records, track daily classroom registrations, view financial history reports, and review analytics dashboards.
            </p>
          </div>
        </section>

        {/* KPI Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="glass-panel h-32 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              cardItems
                .filter(item => item.roles.includes(user?.role))
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.title}
                      className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex flex-col justify-between h-full">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.title}</span>
                        <span className="text-3xl font-bold font-display tracking-tight text-slate-800 dark:text-slate-100 mt-2">{item.value}</span>
                        <Link 
                          to={item.link} 
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mt-4 group"
                        >
                          <span>Manage</span>
                          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                      <div className={`p-4 bg-gradient-to-tr ${item.color} ${item.shadow} text-white rounded-xl shadow-lg`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>

        {/* Quick Shortcuts */}
        <section className="glass-panel rounded-3xl p-8 border border-slate-100 dark:border-slate-800/80">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 font-display">System Action Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/classes" 
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-center font-semibold text-slate-700 hover:text-indigo-600 transition-all dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              Class Registers
            </Link>
            <Link 
              to="/students" 
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-center font-semibold text-slate-700 hover:text-indigo-600 transition-all dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              Enroll Student
            </Link>
            <Link 
              to="/attendance" 
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-center font-semibold text-slate-700 hover:text-indigo-600 transition-all dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              Daily Attendance
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/finance-analytics" 
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-center font-semibold text-slate-700 hover:text-indigo-600 transition-all dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                Financial Charts
              </Link>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
