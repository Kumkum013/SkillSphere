import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/invitations/my').then((res) => setInvitations(res.data.invitations)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, response) => {
    await api.put(`/invitations/${id}/respond`, { response });
    setInvitations((prev) => prev.filter((inv) => inv._id !== id));
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-700 text-ink mb-1">Invitations</h1>
        <p className="text-ink/50 text-sm mb-8">Projects that want you on their team.</p>

        {loading ? (
          <p className="text-sm text-ink/40">Loading...</p>
        ) : invitations.length === 0 ? (
          <div className="glass-card hover-glow rounded-2xl p-8 text-center shadow-soft text-sm text-ink/40">
            No pending invitations right now.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {invitations.map((inv) => (
                <motion.div
                  key={inv._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="glass-card hover-glow rounded-2xl p-5 flex items-center justify-between shadow-soft"
                >
                  <div>
                    <p className="font-medium text-ink">{inv.projectId?.title}</p>
                    <p className="text-sm text-ink/50 mt-0.5">{inv.projectId?.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => respond(inv._id, 'REJECTED')}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-ink/60 hover:border-coral hover:text-coral transition-colors"
                    >
                      Decline
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => respond(inv._id, 'ACCEPTED')}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-match text-bg hover:bg-success hover:text-ink transition-colors"
                    >
                      Accept
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Invitations;
