import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  UserRound,
  ListTodo,
  LogOut,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TopNav = ({
  onToggleSidebar = () => {},
  notificationsCount = 0,
  searchQuery = '',
  onSearchChange = () => {}
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-[#263449] px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <div className="flex items-center w-full bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263449] rounded-xl px-3.5 py-1.5 focus-within:border-[#4F46E5] dark:focus-within:border-[#818CF8] focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 mr-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects, people, skills..."
              className="w-full bg-transparent text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none"
            />
            <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                Ctrl
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                K
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Right Controls: Notifications, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#111827]">
              {notificationsCount > 9 ? '9+' : notificationsCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative flex items-center bg-slate-100 dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263449] p-1 rounded-full h-8 w-15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white dark:bg-[#111827] shadow-sm flex items-center justify-center transition-transform duration-200 ease-in-out ${
              isDark ? 'translate-x-7 text-indigo-400' : 'translate-x-0 text-amber-500'
            }`}
          >
            {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
            <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity ${isDark ? 'opacity-40' : 'opacity-0'}`} />
            <Moon className={`w-3.5 h-3.5 text-indigo-400 transition-opacity ${isDark ? 'opacity-0' : 'opacity-40'}`} />
          </div>
        </button>

        {/* User Profile Pill / Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#263449] transition-all"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className={`hidden sm:inline w-4 h-4 text-slate-400 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#E2E8F0] dark:border-[#263449]">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#172033]"
                >
                  <UserRound className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/todos"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#172033]"
                >
                  <ListTodo className="w-4 h-4 text-slate-400" />
                  <span>My Todos</span>
                </Link>
                <Link
                  to="/projects"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#172033]"
                >
                  <FolderKanban className="w-4 h-4 text-slate-400" />
                  <span>Projects</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#263449]">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
