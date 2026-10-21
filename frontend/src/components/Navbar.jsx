import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  UserRound,
  LogOut,
  ListTodo,
  Bell,
  Compass,
  UserRoundPlus,
  Users,
  GraduationCap,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SkillSphereLogo } from './Sidebar';
import api from '../services/api';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/invitations', label: 'Invitations', icon: Mail },
  { path: '/recommendations', label: 'Discover', icon: Compass },
  { path: '/todos', label: 'Todo', icon: ListTodo },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/join-requests', label: 'Join requests', icon: UserRoundPlus },
  { path: '/profile', label: 'Profile', icon: UserRound }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-[#263449] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <SkillSphereLogo className="w-8 h-8" />
          <span className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
            SkillSphere
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] p-1 shadow-2xs">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            const isNotifications = item.path === '/notifications';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 text-xs lg:text-sm rounded-full transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-white dark:bg-[#111827] text-[#4F46E5] dark:text-[#818CF8] font-semibold shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5] dark:text-[#818CF8]' : 'text-slate-400'}`} />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 rounded-full border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] px-2.5 py-1 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] font-medium max-w-[100px] truncate">
              {user?.name}
            </span>
            {user?.role === 'FACULTY' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Faculty
              </span>
            )}
          </Link>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
