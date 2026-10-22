import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.emailSent) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-3xl font-display font-700 text-white mb-2">Reset Password</h2>
        <p className="text-slate-400 text-sm mb-8">
          {success
            ? 'Check your email for the reset link'
            : 'Enter your email and we\'ll send you a password reset link'
          }
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-400 font-medium mb-2">Email Sent Successfully!</p>
            <p className="text-slate-400 text-sm mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-slate-500 text-xs">
              The link will expire in 1 hour. Check your spam folder if you don't see it.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-300 bg-red-950/80 rounded-lg px-3 py-2.5 border border-red-500/30"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all"
                placeholder="you@college.edu"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0b0f19] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              {submitting ? 'Sending...' : (
                <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
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

export default ForgotPassword;
