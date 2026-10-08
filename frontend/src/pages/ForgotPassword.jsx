import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not request a password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center px-6 py-12">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-300">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold">Forgot password?</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your account email and, if it is registered, we’ll send a one-time reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </label>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-300">{message} Check your inbox and spam folder.</p>}
          <button type="submit" disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </motion.section>
    </main>
  );
};

export default ForgotPassword;
