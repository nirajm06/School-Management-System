import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../utils/api';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Layers, 
  Calendar 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const FinanceAnalytics = () => {
  const [view, setView] = useState('yearly'); // 'monthly' or 'yearly'
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(false);

  const monthsList = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  const yearsList = [2024, 2025, 2026, 2027, 2028];

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analytics/finance', {
        params: { view, year, month }
      });
      if (res.data.success) {
        setChartData(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [view, year, month]);

  const netBalance = summary.totalIncome - summary.totalExpense;

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title="School Financial Analytics" />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Toggle & Filters */}
        <section className="glass-panel rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
          {/* Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setView('yearly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                view === 'yearly'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Yearly Summary
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                view === 'monthly'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Monthly Summary
            </button>
          </div>

          {/* Filters dropdown */}
          <div className="flex items-center gap-3">
            {view === 'monthly' && (
              <div className="flex flex-col gap-1 w-40">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="form-input py-2 text-sm"
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1 w-32">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="form-input py-2 text-sm"
              >
                {yearsList.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Finance KPI Tiles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income summary tile */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tuition Revenue</span>
              <h3 className="text-3xl font-bold font-display text-emerald-600 mt-2">₹{summary.totalIncome}</h3>
              <p className="text-xs text-slate-400 mt-1">Paid student fees collected</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Salary summary tile */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Faculty Payroll Expenses</span>
              <h3 className="text-3xl font-bold font-display text-rose-600 mt-2">₹{summary.totalExpense}</h3>
              <p className="text-xs text-slate-400 mt-1">Teacher salary outlays</p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
          </div>

          {/* Net balance tile */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Net Surplus</span>
              <h3 className={`text-3xl font-bold font-display mt-2 ${netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                {netBalance < 0 ? '-₹' : '₹'}{Math.abs(netBalance)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Operating budget surplus</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <IndianRupee size={24} />
            </div>
          </div>
        </section>

        {/* Finance Charts */}
        <section className="glass-panel rounded-3xl p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 font-display">Revenue vs Expenses Chart</h4>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Showing operating statistics for {view === 'monthly' ? `${monthsList[month].label} ` : ''}{year}
            </span>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Processing graph metrics...</span>
            </div>
          ) : (
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    name="Tuition Revenue (₹)"
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    name="Payroll Expenses (₹)"
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default FinanceAnalytics;
