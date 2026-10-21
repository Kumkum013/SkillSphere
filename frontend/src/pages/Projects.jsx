import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Folder,
  FolderOpen,
  Users,
  Plus,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code2,
  Heart,
  ShoppingCart
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { ProjectEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const Projects = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [scope, setScope] = useState('my');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skills: '', minMatchScore: 50 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Check URL query parameters (e.g. /projects?create=true or ?search=...)
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowForm(true);
    }
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setScope('all');
    }
  }, [searchParams]);

  // Fetch unread notifications count for sidebar/header
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  // Load projects based on selected scope
  const loadProjects = () => {
    setLoading(true);
    api.get(`/projects?scope=${scope}`)
      .then((res) => {
        setProjects(res.data?.projects || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setProjects([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, [scope]);

  // Project creation handler (Preserves existing API integration & validation)
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const requiredSkills = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((skillName) => ({ skillName, weight: 1 }));

    if (requiredSkills.length === 0) {
      setError('Add at least one required skill (comma-separated)');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/projects', {
        title: form.title,
        description: form.description,
        requiredSkills,
        minMatchScore: form.minMatchScore
      });
      setForm({ title: '', description: '', skills: '', minMatchScore: 50 });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter projects by search query in TopNav
  const displayedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.requiredSkills?.some((s) => s.name?.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  // Helper for category icon styling
  const getCategoryMeta = (p) => {
    const text = `${p.title || ''} ${p.description || ''}`.toLowerCase();
    if (text.includes('health') || text.includes('med') || text.includes('care')) {
      return { icon: Heart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    }
    if (text.includes('shop') || text.includes('commerce') || text.includes('store') || text.includes('cart')) {
      return { icon: ShoppingCart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
    }
    if (text.includes('ai') || text.includes('ml') || text.includes('data')) {
      return { icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' };
    }
    return { icon: Code2, color: 'text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationsCount={notificationsCount}
      />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(true)}
          notificationsCount={notificationsCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Projects Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            <Folder className="w-3.5 h-3.5" />
            <span>Projects</span>
          </div>

          {/* Page Heading & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Projects
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Manage your projects and see the teams you joined.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all shrink-0"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> New project
                </>
              )}
            </button>
          </div>

          {/* Project Filter Tabs */}
          <div className="border-b border-[#E2E8F0] dark:border-[#263449] flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'my', label: 'My Projects', icon: Folder },
              { id: 'joined', label: 'Joined Projects', icon: Users },
              { id: 'all', label: 'All Projects', icon: FolderOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = scope === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setScope(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'text-[#4F46E5] dark:text-[#818CF8] font-semibold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-project-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5] dark:bg-[#818CF8]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Project Creation Form (Collapsible) */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreate}
                className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#263449]">
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Create New Project
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl px-3.5 py-2.5 border border-rose-200 dark:border-rose-800">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                    Project Title
                  </label>
                  <input
                    required
                    placeholder="e.g. Distributed Task Orchestrator"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your project's goals, architecture, and what you want to build..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    required
                    placeholder="React, Node.js, TypeScript, Docker"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] text-sm transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                      Minimum Match Score for Invitations
                    </label>
                    <span className="text-xs font-bold text-[#4F46E5] dark:text-[#818CF8]">
                      {form.minMatchScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.minMatchScore}
                    onChange={(e) => setForm({ ...form, minMatchScore: parseInt(e.target.value) })}
                    className="w-full accent-[#4F46E5] dark:accent-[#818CF8] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Candidates with this score or higher will be recommended for team matching
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#263449] text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Project List / Empty State / Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse"
                />
              ))}
            </div>
          ) : displayedProjects.length === 0 ? (
            /* Empty State Container (Matches Reference Image) */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-10 sm:p-16 text-center shadow-xs">
              <ProjectEmptyIllustration className="w-32 h-32 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                No open projects yet.
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 mb-6 max-w-md mx-auto">
                Be the first to create a project and start building something amazing!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first project</span>
              </button>
            </div>
          ) : (
            /* Populated Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedProjects.map((p) => {
                const meta = getCategoryMeta(p);
                const CategoryIcon = meta.icon;
                const members = p.members || [];

                return (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="group bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Category Icon, Title, Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}>
                            <CategoryIcon className="w-4.5 h-4.5" />
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors truncate">
                            {p.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : p.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {p.status || 'OPEN'}
                        </span>
                      </div>

                      {/* Match Score Indicator (if available on All Projects tab) */}
                      {scope === 'all' && p.matchScore !== null && p.matchScore !== undefined && (
                        <div className="flex items-center gap-2 mb-3 bg-[#F8FAFC] dark:bg-[#172033] p-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449]">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{p.matchScore}% Skill Match</span>
                          </div>
                          {p.matchScore >= (p.minMatchScore || 50) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-3">
                        {p.description || 'No description provided.'}
                      </p>

                      {/* Required Skills Tags */}
                      {p.requiredSkills && p.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.requiredSkills.slice(0, 4).map((s, idx) => (
                            <span
                              key={s.skillId || idx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#172033] text-slate-600 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#263449]"
                            >
                              {s.name}
                            </span>
                          ))}
                          {p.requiredSkills.length > 4 && (
                            <span className="text-[11px] text-slate-400 self-center">
                              +{p.requiredSkills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer: Team Members & Navigation Arrow */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      {/* Member Avatars */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {(members.length > 0 ? members : [{ name: p.ownerId?.name || 'Owner' }])
                          .slice(0, 3)
                          .map((m, idx) => (
                            <div
                              key={idx}
                              title={m.name || 'Member'}
                              className={`inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#111827] text-white text-[10px] font-bold flex items-center justify-center ${
                                idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            >
                              {(m.name?.[0] || 'M').toUpperCase()}
                            </div>
                          ))}
                        {members.length > 3 && (
                          <div className="inline-block h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-[#111827] text-slate-600 dark:text-slate-300 text-[9px] font-bold flex items-center justify-center">
                            +{members.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Arrow link */}
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Projects;
