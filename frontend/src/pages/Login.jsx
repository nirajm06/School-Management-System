import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already authenticated, redirect to home dashboard
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!emailOrUsername || !password) {
      setError('Please provide all credentials');
      return;
    }

    setLoading(true);
    const result = await login(emailOrUsername, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 px-4 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse"></div>

      <div className="w-full max-w-md z-10">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10 flex flex-col gap-6">
          
          {/* Header logo / details */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3.5 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">Welcome to EduSphere</h2>
              <p className="text-sm text-slate-400 mt-1">Access the school portal using credentials</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="emailOrUsername" className="text-sm font-semibold text-slate-300">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="admin or teacher"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Seed info help box */}
          <div className="border-t border-slate-700/50 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Admin: <span className="text-slate-300 font-mono">Admin / admin123</span>
              <br />
              Teacher: <span className="text-slate-300 font-mono">Teacher / teacher123</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
