import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Mail, User, LogOut, Sparkles, ListTodo, Bell, Compass, UserRoundCheck, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/invitations', label: 'Invitations', icon: Mail },
  { path: '/recommendations', label: 'Discover', icon: Compass },
  { path: '/todos', label: 'Todo', icon: ListTodo },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/join-requests', label: 'Join requests', icon: UserRoundCheck },
  { path: '/profile', label: 'Profile', icon: User }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then((res) => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="font-display font-700 text-lg tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f87171] to-[#fb7185] flex items-center justify-center shadow-lg shadow-[#f87171]/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          SkillSphere
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 p-1.5 shadow-inner shadow-slate-950/40">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            const isNotifications = item.path === '/notifications';

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-2 text-sm rounded-full transition-colors flex items-center gap-1.5"
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-[#f87171]/10 rounded-full border border-[#f87171]/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className="relative">
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${active ? 'text-[#f87171]' : 'text-slate-400'}`} />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#f87171] text-[9px] font-bold text-white flex items-center justify-center z-20">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`relative z-10 hidden lg:inline ${active ? 'text-[#f87171] font-medium' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f87171] to-[#fb7185] flex items-center justify-center text-white text-xs font-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-slate-200 font-medium">{user?.name}</span>
            {user?.role === 'FACULTY' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Faculty
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="text-sm p-2 rounded-full text-slate-300 hover:bg-[#f87171]/10 hover:text-[#f87171] transition-colors border border-slate-700 bg-slate-900/70"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
