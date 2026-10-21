import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Mail,
  Compass,
  ListTodo,
  Bell,
  UserRoundPlus,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/invitations', label: 'Invitations', icon: Mail, badgeKey: 'invitations' },
  { path: '/recommendations', label: 'Discover', icon: Compass },
  { path: '/todos', label: 'Todo', icon: ListTodo },
  { path: '/notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { path: '/join-requests', label: 'Join requests', icon: UserRoundPlus }
];

export const SkillSphereLogo = ({ className = 'w-9 h-9' }) => (
  <div className={`${className} rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  </div>
);

const Sidebar = ({
  isOpen = false,
  onClose = () => {},
  notificationsCount = 0,
  invitationsCount = 0
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getBadgeValue = (key) => {
    if (key === 'notifications' && notificationsCount > 0) return notificationsCount;
    if (key === 'invitations' && invitationsCount > 0) return invitationsCount;
    return null;
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';
  const userRole = user?.role === 'FACULTY' ? 'Faculty' : 'Student';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#263449] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="p-6 border-b border-transparent">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
              <SkillSphereLogo />
              <div>
                <span className="block text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-tight group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                  SkillSphere
                </span>
                <span className="block text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Learn · Build · Grow
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            const badge = getBadgeValue(item.badgeKey);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] font-semibold shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#172033] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[19px] h-[19px] ${
                      isActive ? 'text-[#4F46E5] dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'
                    }`}
                    strokeWidth={isActive ? 2.2 : 2}
                  />
                  <span>{item.label}</span>
                </div>

                {badge !== null && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#263449]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors">
            <Link to="/profile" onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {userInitial}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-tight">
                  {userRole}
                </p>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
