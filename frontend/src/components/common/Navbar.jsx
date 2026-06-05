import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon, Calendar } from 'lucide-react';

const Navbar = ({ title }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="h-20 glass-panel border-b flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 transition-all duration-300 dark:border-slate-800">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar size={16} />
          <span>{formatDate()}</span>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60 transition-all text-slate-600 dark:text-slate-300"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
