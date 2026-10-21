import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, ArrowRight, FolderKanban, Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { InvitationsPageEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchNavQuery, setSearchNavQuery] = useState('');

  // Fetch unread notifications count for sidebar/header
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    api.get('/invitations/my')
      .then((res) => setInvitations(res.data?.invitations || []))
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Respond to invitation (Preserves existing API integration & state logic)
  const respond = async (id, response) => {
    try {
      await api.put(`/invitations/${id}/respond`, { response });
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationsCount={notificationsCount}
        invitationsCount={invitations.length}
      />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(true)}
          notificationsCount={notificationsCount}
          searchQuery={searchNavQuery}
          onSearchChange={setSearchNavQuery}
        />

        {/* Invitations Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading (Matching Visual Guide) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                Invitations
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Projects that want you on their team.
              </p>
            </div>
          </div>

          {/* Invitations Content Area */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse"
                />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            /* Empty State Container (Matches Reference Image) */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl min-h-[340px] sm:min-h-[380px] p-10 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
              <InvitationsPageEmptyIllustration className="w-36 h-36 mb-2" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                No pending invitations right now.
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1.5 max-w-md mx-auto">
                When someone invites you to a project, it will show up here.
              </p>
            </div>
          ) : (
            /* Populated Invitations List */
            <div className="space-y-4">
              <AnimatePresence>
                {invitations.map((inv) => (
                  <motion.div
                    key={inv._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
                        <FolderKanban className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] truncate">
                          {inv.projectId?.title || 'Project Invitation'}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
                          {inv.projectId?.description || 'You have been invited to join this project team.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {inv.invitedBy?.name && (
                            <span>Invited by <strong className="text-[#0F172A] dark:text-[#F1F5F9]">{inv.invitedBy.name}</strong></span>
                          )}
                          {inv.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(inv.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Decline & Accept */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => respond(inv._id, 'REJECTED')}
                        className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => respond(inv._id, 'ACCEPTED')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Invitations;
