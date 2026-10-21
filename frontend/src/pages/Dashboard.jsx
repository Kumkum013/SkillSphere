import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  CircleCheck,
  Mail,
  FolderOpen,
  CalendarDays,
  Plus,
  ArrowRight,
  ChevronRight,
  Zap,
  Users,
  Search,
  FileText,
  Sparkles,
  GraduationCap,
  GitPullRequest,
  Code2,
  Heart,
  ShoppingCart,
  Layers,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import {
  Sparkline,
  TaskEmptyIllustration,
  InvitationEmptyIllustration,
  TeamBannerIllustration
} from '../components/DashboardIllustrations';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskTab, setTaskTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    Promise.all([
      api.get('/tasks/my').catch(() => ({ data: { tasks: [] } })),
      api.get('/invitations/my').catch(() => ({ data: { invitations: [] } })),
      api.get('/projects?limit=8').catch(() => ({ data: { projects: [] } })),
      api.get('/notifications/unread-count').catch(() => ({ data: { unreadCount: 0 } }))
    ])
      .then(([tasksRes, invRes, projRes, notifRes]) => {
        setTasks(tasksRes.data?.tasks || []);
        setInvitations(invRes.data?.invitations || []);
        setProjects(projRes.data?.projects || []);
        setUnreadNotifications(notifRes.data?.unreadCount || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute metrics
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'COMPLETED'), [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.status === 'COMPLETED').length, [tasks]);

  // Mark task completed (Preserves existing API handler)
  const markCompleted = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: 'COMPLETED' });
      setTasks((current) =>
        current.map((task) => (task._id === taskId ? { ...task, status: 'PENDING_REVIEW' } : task))
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Filter tasks based on selected tab
  const filteredTasks = useMemo(() => {
    if (taskTab === 'IN_PROGRESS') {
      return tasks.filter((t) => t.status === 'IN_PROGRESS');
    }
    if (taskTab === 'DUE_SOON') {
      const now = new Date();
      const inOneWeek = new Date();
      inOneWeek.setDate(now.getDate() + 7);
      return tasks.filter((t) => {
        if (!t.deadline || t.status === 'COMPLETED') return false;
        const d = new Date(t.deadline);
        return d >= now && d <= inOneWeek;
      });
    }
    if (taskTab === 'COMPLETED') {
      return tasks.filter((t) => t.status === 'COMPLETED');
    }
    return tasks;
  }, [tasks, taskTab]);

  // Filter projects by search query
  const displayedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return projects
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.requiredSkills?.some((s) => s.name?.toLowerCase().includes(q))
      )
      .slice(0, 4);
  }, [projects, searchQuery]);

  // Helper for dynamic project category & styling
  const getProjectMetadata = (p) => {
    const text = `${p.title || ''} ${p.description || ''}`.toLowerCase();
    if (text.includes('health') || text.includes('med') || text.includes('care') || text.includes('hospital')) {
      return {
        category: 'Healthcare',
        colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        icon: Heart
      };
    }
    if (text.includes('shop') || text.includes('commerce') || text.includes('store') || text.includes('cart')) {
      return {
        category: 'E-commerce',
        colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        icon: ShoppingCart
      };
    }
    if (text.includes('ai') || text.includes('ml') || text.includes('data') || text.includes('model')) {
      return {
        category: 'AI & Data Science',
        colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        icon: Sparkles
      };
    }
    return {
      category: p.requiredSkills?.[0]?.name || 'Web Development',
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      icon: Code2
    };
  };

  // Formatted current date string
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const userName = user?.name ? user.name.split(' ')[0] : 'Kumkum';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationsCount={unreadNotifications}
        invitationsCount={invitations.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(true)}
          notificationsCount={unreadNotifications}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-7">
          {/* Welcome Header Section */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                Welcome back,
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                {userName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                Here's what's happening across your projects, tasks and team activity.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Calendar Date Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F1F5F9] shadow-xs">
                <CalendarDays className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                <span>{formattedDate}</span>
              </div>

              {/* Primary Create Project Button */}
              <button
                onClick={() => navigate('/projects?create=true')}
                className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create project</span>
              </button>
            </div>
          </section>

          {/* Statistics Cards Row */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse" />
              ))}
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Active Tasks */}
              <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#F43F5E] flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Active tasks
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {activeTasks.length}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> No change from last week
                  </span>
                  <Sparkline color="#F43F5E" className="w-16 h-6" />
                </div>
              </div>

              {/* Card 2: Completed Tasks */}
              <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] flex items-center justify-center">
                    <CircleCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Completed tasks
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {completedCount}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> No change from last week
                  </span>
                  <Sparkline color="#10B981" className="w-16 h-6" />
                </div>
              </div>

              {/* Card 3: Pending Invitations */}
              <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F59E0B] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Pending invitations
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {invitations.length}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> No change from last week
                  </span>
                  <Sparkline color="#F59E0B" className="w-16 h-6" />
                </div>
              </div>

              {/* Card 4: Open Projects */}
              <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Open projects
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {projects.length}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +1 from last week
                  </span>
                  <Sparkline color="#4F46E5" className="w-16 h-6" />
                </div>
              </div>
            </section>
          )}

          {/* Middle Section: Tasks + Pending Invitations + Quick Actions & Promo */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Your Tasks (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#263449]">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[#4F46E5] dark:text-[#818CF8]" />
                    <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      Your tasks
                    </h2>
                  </div>
                  <Link
                    to="/todos"
                    className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 pt-3 pb-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800/80">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'IN_PROGRESS', label: 'In progress' },
                    { id: 'DUE_SOON', label: 'Due soon' },
                    { id: 'COMPLETED', label: 'Completed' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTaskTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        taskTab === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-[#818CF8] font-semibold'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Task List or Empty State */}
                <div className="pt-4">
                  {filteredTasks.length === 0 ? (
                    <div className="py-8 text-center">
                      <TaskEmptyIllustration className="w-24 h-24 mb-3" />
                      <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        No tasks assigned yet.
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-xs mx-auto">
                        Tasks assigned to you will appear here.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#E2E8F0] dark:divide-[#263449] max-h-80 overflow-y-auto pr-1">
                      {filteredTasks.map((t) => (
                        <li key={t._id} className="py-3 flex items-start justify-between gap-3 group">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                              {t.title}
                            </p>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                              {t.projectId?.title || 'Project'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                              {t.requiredSkill && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {t.requiredSkill}
                                </span>
                              )}
                              {t.deadline && (
                                <span>Due {new Date(t.deadline).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                t.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : t.status === 'PENDING_REVIEW'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              }`}
                            >
                              {t.status.replace('_', ' ')}
                            </span>
                            {t.status !== 'COMPLETED' && t.status !== 'PENDING_REVIEW' && (
                              <button
                                onClick={() => markCompleted(t._id)}
                                className="text-[11px] text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                              >
                                Mark completed
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Pending Invitations (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#263449]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#F59E0B]" />
                    <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      Pending invitations
                    </h2>
                  </div>
                  <Link
                    to="/invitations"
                    className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Invitations List or Empty State */}
                <div className="pt-6">
                  {invitations.length === 0 ? (
                    <div className="py-8 text-center">
                      <InvitationEmptyIllustration className="w-24 h-24 mb-3" />
                      <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        No pending invitations.
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-xs mx-auto">
                        You'll see project invitations here when someone invites you to join.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {invitations.map((inv) => (
                        <li
                          key={inv._id}
                          className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                        >
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                            {inv.projectId?.title || 'Project Invitation'}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            Invited by {inv.invitedBy?.name || 'Project Lead'}
                          </p>
                          <Link
                            to="/invitations"
                            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                          >
                            Respond to invitation <ArrowRight className="w-3 h-3" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Quick Actions + Promo Banner (3 cols) */}
            <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
              {/* Quick Actions Card */}
              <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Quick Actions
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {/* Create Project Button */}
                  <button
                    onClick={() => navigate('/projects?create=true')}
                    className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create Project
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Find Teammates */}
                  <Link
                    to="/students"
                    className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-[#263449] text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" /> Find Teammates
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {/* Browse Projects */}
                  <Link
                    to="/projects"
                    className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-[#263449] text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-500" /> Browse Projects
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {/* Upload Resume */}
                  <Link
                    to="/profile"
                    className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-[#263449] text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" /> Upload Resume
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Promo Banner Card (Better Teams Build Better Projects) */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 dark:from-[#172033] dark:via-[#111827] dark:to-[#172033] border border-indigo-100 dark:border-[#263449] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <TeamBannerIllustration className="w-full h-20 mb-2" />
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Better Teams Build Better Projects
                  </h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 mb-3">
                    Find your people. Build your dreams.
                  </p>

                  <button
                    onClick={() => navigate('/recommendations')}
                    className="w-full py-2 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors mb-3"
                  >
                    <span>Explore Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-indigo-100/60 dark:border-slate-800 text-[11px]">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Smart Matchmaking</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Find teammates with the right skills</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Track Contributions</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">See real GitHub activity & scores</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Get Mentored</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Learn from faculty & industry experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Section: Open Projects */}
          <section className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#263449] mb-5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#4F46E5] dark:text-[#818CF8]" />
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Open projects
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-indigo-300 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2x2 Grid of Project Cards */}
            {displayedProjects.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                  No open projects found.
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Create a new project or adjust your search filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProjects.map((p) => {
                  const meta = getProjectMetadata(p);
                  const Icon = meta.icon;

                  // Member avatars: either real member initials or fallback
                  const memberList = (p.members && p.members.length > 0)
                    ? p.members
                    : [{ name: p.ownerId?.name || 'Kumkum' }];

                  return (
                    <Link
                      key={p._id}
                      to={`/projects/${p._id}`}
                      className="group relative p-4 rounded-xl border border-[#E2E8F0] dark:border-[#263449] hover:border-indigo-300 dark:hover:border-indigo-700 bg-[#F8FAFC]/50 dark:bg-[#172033]/50 hover:bg-white dark:hover:bg-[#172033] hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      {/* Top Part: Icon, Title, Description, Category Tag */}
                      <div className="flex items-start gap-3">
                        {/* Tinted Category Icon Box */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors truncate">
                            {p.title}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                            {p.description || 'Project collaboration workspace'}
                          </p>
                        </div>

                        {/* Category Tag Pill */}
                        <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.badgeBg}`}>
                          {meta.category}
                        </span>
                      </div>

                      {/* Bottom Part: Team Avatar Stack & Arrow */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        {/* Avatar stack */}
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {memberList.slice(0, 2).map((m, idx) => (
                            <div
                              key={idx}
                              title={m.name || 'Member'}
                              className={`inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#111827] text-white text-[10px] font-bold flex items-center justify-center ${
                                idx === 0 ? 'bg-rose-500' : 'bg-indigo-500'
                              }`}
                            >
                              {(m.name?.[0] || 'M').toUpperCase()}
                            </div>
                          ))}
                          {memberList.length > 2 && (
                            <div className="inline-block h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-[#111827] text-slate-600 dark:text-slate-300 text-[9px] font-bold flex items-center justify-center">
                              +{memberList.length - 2}
                            </div>
                          )}
                        </div>

                        {/* Arrow Link Indicator */}
                        <div className="text-slate-400 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] group-hover:translate-x-0.5 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
