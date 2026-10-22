import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password
      });
      if (response.data.message) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl shadow-black/30"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-glow">
          <Lock className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-3xl font-display font-700 text-white mb-2">Set New Password</h2>
        <p className="text-slate-400 text-sm mb-8">
          {success
            ? 'Password reset successful! Redirecting to login...'
            : 'Enter your new password below'
          }
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-400 font-medium mb-2">Password Reset Successful!</p>
            <p className="text-slate-400 text-sm">
              You can now log in with your new password
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-300 bg-red-950/80 rounded-lg px-3 py-2.5 border border-red-500/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0b0f19] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              {submitting ? 'Resetting...' : (
                <>Reset Password <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 mt-6">
          Remember your password? <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
