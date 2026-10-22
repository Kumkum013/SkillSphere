import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Users, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const floatingBadges = [
  { label: 'React', top: '15%', left: '10%', delay: 0 },
  { label: 'Python', top: '55%', left: '5%', delay: 0.5 },
  { label: 'UI/UX', top: '75%', left: '25%', delay: 1 },
  { label: 'Node.js', top: '20%', left: '70%', delay: 0.3 },
  { label: 'ML', top: '60%', left: '75%', delay: 0.8 }
];

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0b0f19] text-white">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#0f172a] items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.04]" />

        {floatingBadges.map((b) => (
          <motion.div
            key={b.label}
            className="absolute text-xs font-medium px-3 py-1.5 rounded-full glass-dark text-white"
            style={{ top: b.top, left: b.left }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          >
            {b.label}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-match to-match2 flex items-center justify-center mb-8 shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-display font-700 text-white leading-tight mb-4">
            Find teammates who actually fit your project.
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            SkillSphere matches you with students whose skills complement what your project needs — ranked, scored, and ready to invite.
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Target className="w-4 h-4 text-match" /> Skill-based matching
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Users className="w-4 h-4 text-match2" /> Real team formation
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#0b0f19]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl shadow-black/30"
        >
          <div className="mb-8 lg:hidden text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-match to-match2 inline-flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-700 text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Log in to find your next teammates</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-300 bg-red-950/80 rounded-lg px-3 py-2.5 border border-red-500/30">
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-300">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-300">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
                placeholder="••••••••"
              />
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded">
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0b0f19] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {submitting ? 'Logging in...' : (
                <>Log In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account? <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
