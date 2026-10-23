import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Mail,
  Compass,
  ListTodo,
  Bell,
  UserRoundPlus,
  UserRound,
  Briefcase,
  Clock,
  DollarSign,
  FileBarChart,
  Layers,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export const SkillSphereLogo = ({ className = 'w-9 h-9' }) => (
  <div className={`${className} rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  </div>
);

const primaryNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/invitations', label: 'Invitations', icon: Mail, badgeKey: 'invitations' },
  { path: '/recommendations', label: 'Discover', icon: Compass },
  { path: '/todos', label: 'Todo', icon: ListTodo },
  { path: '/notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { path: '/join-requests', label: 'Join requests', icon: UserRoundPlus },
  { path: '/profile', label: 'Profile', icon: UserRound }
];

const secondaryNavItems = [
  { path: '/clients', label: 'Clients', icon: Briefcase },
  { path: '/time-tracking', label: 'Time Tracking', icon: Clock },
  { path: '/financials', label: 'Financials', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/templates', label: 'Templates', icon: Layers }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchNavQuery, setSearchNavQuery] = useState('');

  const profileRef = useRef(null);
  const moreRef = useRef(null);

  // Fetch counts for badges
  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then((res) => setUnreadCount(res.data?.unreadCount || 0))
        .catch(() => {});

      api.get('/invitations/my')
        .then((res) => setInvitationsCount(res.data?.invitations?.length || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const isItemActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isAnySecondaryActive = secondaryNavItems.some((item) => isItemActive(item.path));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchNavQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchNavQuery.trim())}`);
      setSearchNavQuery('');
      setMobileMenuOpen(false);
    }
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] dark:border-indigo-500/15 bg-white/95 dark:bg-[#070B1B]/95 backdrop-blur-md transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-17 sm:h-18 flex items-center justify-between gap-3 lg:gap-4">
        {/* Left Section: Branding */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <SkillSphereLogo className="w-8 h-8 sm:w-9 sm:h-9" />
          <span className="font-bold text-base sm:text-lg lg:text-xl tracking-tight text-[#0F172A] dark:text-[#F5F7FF] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
            SkillSphere
          </span>
        </Link>

        {/* Center Section: Primary Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 flex-1 justify-center max-w-4xl">
          {primaryNavItems.map((item) => {
            const active = isItemActive(item.path);
            const Icon = item.icon;
            const badgeCount =
              item.badgeKey === 'notifications'
                ? unreadCount
                : item.badgeKey === 'invitations'
                ? invitationsCount
                : 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-full text-xs lg:text-[13px] font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  active
                    ? 'bg-indigo-50 dark:bg-[#161F38] text-[#4F46E5] dark:text-[#A5B4FC] font-semibold border border-indigo-200/90 dark:border-indigo-500/30 shadow-2xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F5F7FF] hover:bg-slate-100/70 dark:hover:bg-[#111A2E]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4 h-4 ${
                      active
                        ? 'text-[#4F46E5] dark:text-[#818CF8]'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* "More" Secondary Navigation Dropdown */}
          <div className="relative shrink-0" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-1.5 rounded-full text-xs lg:text-[13px] font-medium transition-all flex items-center gap-1 shrink-0 ${
                isAnySecondaryActive || moreOpen
                  ? 'bg-indigo-50 dark:bg-[#161F38] text-[#4F46E5] dark:text-[#A5B4FC] font-semibold border border-indigo-200/90 dark:border-indigo-500/30 shadow-2xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F5F7FF] hover:bg-slate-100/70 dark:hover:bg-[#111A2E]'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#111A2E] border border-[#E2E8F0] dark:border-indigo-500/20 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                {secondaryNavItems.map((item) => {
                  const active = isItemActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2 text-xs lg:text-sm transition-colors ${
                        active
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] font-semibold'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Icon Button */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-[#070B1B]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Light/Dark Theme Switch */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="w-4.5 h-4.5 text-indigo-400" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
          </button>

          {/* User Profile Pill / Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#E2E8F0] dark:border-indigo-500/25 bg-[#F8FAFC] dark:bg-[#0E152E] hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
              aria-expanded={profileOpen}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {userInitial}
              </div>
              <span className="hidden sm:inline text-xs sm:text-sm text-[#0F172A] dark:text-[#F5F7FF] font-medium max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111A2E] border border-[#E2E8F0] dark:border-indigo-500/20 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F5F7FF] truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                    {user?.email}
                  </p>
                  {user?.role === 'FACULTY' && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800">
                      <GraduationCap className="w-3 h-3" />
                      Faculty
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-[#16213B] transition-colors"
                  >
                    <UserRound className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/todos"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-[#16213B] transition-colors"
                  >
                    <ListTodo className="w-4 h-4 text-slate-400" />
                    <span>My Todos</span>
                  </Link>
                  <Link
                    to="/projects"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-[#16213B] transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-slate-400" />
                    <span>Projects</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E2E8F0] dark:border-indigo-500/15 bg-white dark:bg-[#070B1B] px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2">
          {/* Quick Search in Mobile Menu */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchNavQuery}
              onChange={(e) => setSearchNavQuery(e.target.value)}
              placeholder="Search projects, skills..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-indigo-500/20 bg-[#F8FAFC] dark:bg-[#0E152E] text-xs sm:text-sm text-[#0F172A] dark:text-[#F5F7FF] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </form>

          {/* Primary Mobile Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-3 py-1">
              Main Menu
            </p>
            {primaryNavItems.map((item) => {
              const active = isItemActive(item.path);
              const Icon = item.icon;
              const badgeCount =
                item.badgeKey === 'notifications'
                  ? unreadCount
                  : item.badgeKey === 'invitations'
                  ? invitationsCount
                  : 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-[#161F38] text-[#4F46E5] dark:text-[#A5B4FC] font-semibold border border-indigo-200 dark:border-indigo-500/30'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-[#111A2E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Mobile Links */}
          <div className="space-y-1 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-3 py-1">
              Workspace & Tools
            </p>
            {secondaryNavItems.map((item) => {
              const active = isItemActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-[#161F38] text-[#4F46E5] dark:text-[#A5B4FC] font-semibold border border-indigo-200 dark:border-indigo-500/30'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F5F7FF] hover:bg-slate-50 dark:hover:bg-[#111A2E]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
