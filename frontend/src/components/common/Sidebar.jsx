import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  School, 
  CalendarCheck, 
  Receipt, 
  TrendingUp, 
  LogOut, 
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { name: 'Classes', path: '/classes', icon: School, roles: ['admin', 'teacher'] },
    { name: 'Teachers', path: '/teachers', icon: Users, roles: ['admin'] },
    { name: 'Students', path: '/students', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'teacher'] },
    { name: 'Fees Ledger', path: '/fees', icon: Receipt, roles: ['admin'] },
    { name: 'Finances', path: '/finance-analytics', icon: TrendingUp, roles: ['admin'] }
  ];

  return (
    <aside className="w-64 glass-panel h-screen fixed left-0 top-0 flex flex-col justify-between p-6 border-r transition-all duration-300 dark:border-slate-800">
      <div className="flex flex-col gap-8">
        {/* Brand logo header */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-xl shadow-md shadow-indigo-200 dark:shadow-none">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">EduSphere</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">School Dashboard</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navItems
            .filter(item => item.roles.includes(user?.role))
            .map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'active-sidebar-link' : 'inactive-sidebar-link'
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
        </nav>
      </div>

      {/* User profile & logout section */}
      <div className="flex flex-col gap-4 border-t pt-4 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.username}</h4>
            <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{user?.role} Portal</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
