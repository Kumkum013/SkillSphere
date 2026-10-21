import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  UserRoundPlus,
  FolderKanban,
  Mail,
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { NotificationsEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [searchNavQuery, setSearchNavQuery] = useState('');

  const load = () => {
    return api
      .get('/notifications')
      .then((res) => {
        setItems(res.data.notifications || []);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    // Also fetch invitations count for sidebar badge accuracy
    api
      .get('/invitations/my')
      .then((res) => {
        setInvitationsCount(res.data?.invitations?.length || 0);
      })
      .catch(() => {});
  }, []);

  const read = async (id) => {
    // Optimistic read
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, read: true } : item))
    );
    try {
      await api.put(`/notifications/${id}/read`);
      load();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      load();
    }
  };

  const markAllRead = async () => {
    // Optimistic read all
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await api.put('/notifications/read-all');
      load();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      load();
    }
  };

  const removeNotification = async (id) => {
    // Optimistic delete
    setItems((prev) => prev.filter((item) => item._id !== id));
    try {
      await api.delete(`/notifications/${id}`);
      load();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      load();
    }
  };

  const unreadCount = items.filter((i) => !i.read).length;
  const filteredItems = filter === 'unread' ? items.filter((i) => !i.read) : items;

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'JOIN_REQUEST':
        return <UserRoundPlus className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />;
      case 'PROJECT_INVITE':
        return <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'PROJECT_UPDATE':
        return <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationsCount={unreadCount}
        invitationsCount={invitationsCount}
      />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(true)}
          notificationsCount={unreadCount}
          searchQuery={searchNavQuery}
          onSearchChange={setSearchNavQuery}
        />

        {/* Notifications Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading matching visual guide */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8] shrink-0 shadow-2xs">
                <Bell className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Notifications
                </h1>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Stay updated on team requests, task reviews, and faculty endorsements.
                </p>
              </div>
            </div>

            {/* Mark all read button */}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0 self-start sm:self-center"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs: All & Unread */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
                  : 'bg-white dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#263449] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
                  : 'bg-white dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#263449] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Content Area: Loading, Empty, or Populated List */}
          {loading ? (
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-14 text-center shadow-xs">
              <Loader2 className="w-7 h-7 text-[#4F46E5] dark:text-[#818CF8] animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Loading your notifications...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty State Card matching the reference image */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-8 sm:p-14 text-center shadow-xs min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center transition-colors">
              <NotificationsEmptyIllustration className="w-40 h-28 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2 tracking-tight">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet.'}
              </h3>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                {filter === 'unread'
                  ? "You're all caught up! There are no unread notifications right now."
                  : "You'll see updates here when something new happens."}
              </p>
            </div>
          ) : (
            /* Populated Notifications List */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl shadow-xs overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#263449] transition-colors">
              {filteredItems.map((item) => {
                const isUnread = !item.read;

                return (
                  <div
                    key={item._id}
                    className={`group p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                      isUnread
                        ? 'bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#172033]/60'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    <div className="pt-2 shrink-0">
                      {isUnread ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] dark:bg-[#818CF8] block shadow-xs"
                          title="Unread"
                        />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-transparent block" />
                      )}
                    </div>

                    {/* Icon container */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#172033] border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          isUnread
                            ? 'font-semibold text-[#0F172A] dark:text-[#F1F5F9]'
                            : 'font-normal text-[#334155] dark:text-[#CBD5E1]'
                        }`}
                      >
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </span>
                      </div>

                      {/* Optional Context Action */}
                      {item.type === 'JOIN_REQUEST' && (
                        <div className="mt-2.5">
                          <Link
                            to="/join-requests"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] transition-colors group/link"
                          >
                            <span>Review join request</span>
                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 self-center">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => read(item._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#4F46E5] dark:text-[#818CF8] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNotification(item._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
