import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, Trash2, Bell, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const load = () => {
    api.get('/notifications').then((res) => setItems(res.data.notifications || []));
  };

  useEffect(() => {
    load();
  }, []);

  const read = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  const removeNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    load();
  };

  const filteredItems = filter === 'unread' ? items.filter((i) => !i.read) : items;
  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#f87171]" />
              <h1 className="text-3xl font-display font-700 text-white">Notifications</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Stay updated on team requests, task reviews, and faculty endorsements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-xs font-medium text-slate-200 hover:text-white hover:border-[#f87171]/40 flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#f87171]" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#f87171]/20 text-[#fca5a5] border border-[#f87171]/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-[#f87171]/20 text-[#fca5a5] border border-[#f87171]/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-sm text-slate-400 shadow-soft">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className={`glass-card rounded-2xl p-4 flex items-start gap-4 transition-all ${
                  item.read ? 'opacity-65' : 'border-[#f87171]/30 bg-slate-900/50'
                }`}
              >
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#f87171] mt-2 flex-shrink-0 animate-pulse" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  {item.type === 'JOIN_REQUEST' && (
                    <Link
                      to="/join-requests"
                      className="inline-block text-xs text-[#fca5a5] mt-2 hover:underline font-medium"
                    >
                      Review join request &rarr;
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!item.read && (
                    <button
                      onClick={() => read(item._id)}
                      className="text-xs text-[#f87171] hover:text-[#fca5a5] px-2 py-1 rounded-lg hover:bg-slate-800"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(item._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
