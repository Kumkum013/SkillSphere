import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'STUDENT', branch: '', year: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ ...form, year: form.year ? Number(form.year) : undefined });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full mt-1.5 px-4 py-3 rounded-xl border border-border bg-bg text-ink focus:outline-none focus:ring-4 focus:ring-match/10 focus:border-match text-sm transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-match/15 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-match2/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-match to-match2 inline-flex items-center justify-center mb-4 shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-700 text-ink">Create your account</h1>
          <p className="text-ink/50 text-sm mt-1">Find teammates who fit your project</p>
        </div>

        <div className="glass-card hover-glow rounded-2xl p-7 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2.5 border border-coral/20">{error}</div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-success bg-success/10 rounded-lg px-3 py-2.5 border border-success/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Account created — <Link to="/login" className="font-medium underline">log in now</Link>
              </motion.div>
            )}

            <div>
              <label className="text-xs font-medium text-ink/60">Full name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-ink/60">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-ink/60">Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink/60">Branch</label>
                <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="IT" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/60">Year</label>
                <input type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="3" className={inputClass} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-match text-bg text-sm font-medium py-3.5 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft"
            >
              {submitting ? 'Creating account...' : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account? <Link to="/login" className="text-match font-medium hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
