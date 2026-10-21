import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { StudentEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchNavQuery, setSearchNavQuery] = useState('');

  const [filters, setFilters] = useState({
    skill: '',
    year: '',
    branch: '',
    availability: '',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch unread notifications count for sidebar/header
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  // Load students with parameters (Preserves existing API integration)
  const loadStudents = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);

      if (filters.skill) params.append('skill', filters.skill);
      if (filters.year) params.append('year', filters.year);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/students?${params.toString()}`);
      setStudents(res.data.students || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ skill: '', year: '', branch: '', availability: '', search: '' });
  };

  // Sync top search bar to filters.search
  const handleTopNavSearch = (val) => {
    setSearchNavQuery(val);
    setFilters((prev) => ({ ...prev, search: val }));
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
          searchQuery={searchNavQuery}
          onSearchChange={handleTopNavSearch}
        />

        {/* Students Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                Browse Students
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Find students with specific skills and experience.
              </p>
            </div>
          </div>

          {/* Filters Panel (Card) */}
          <section className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#263449] mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Filters
                </h2>
              </div>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            {/* Filter Input Controls (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. Search by name/email */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5 block">
                  Search by name/email
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {/* 2. Skill */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5 block">
                  Skill
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Java"
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* 3. Year */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5 block">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                >
                  <option value="">All years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              {/* 4. Branch */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5 block">
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g., CSE, ECE"
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* 5. Availability */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5 block">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>
          </section>

          {/* Error and Rate-Limit Alert Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs sm:text-sm text-rose-700 dark:text-rose-300 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Results / Loading / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse"
                />
              ))}
            </div>
          ) : students.length === 0 ? (
            /* Empty State Container (Matches Reference Image) */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-12 sm:p-16 text-center shadow-xs">
              <StudentEmptyIllustration className="w-32 h-32 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                No students found matching your filters.
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 mb-6 max-w-md mx-auto">
                Try adjusting your filters or check back later for new students.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-[#4F46E5] dark:text-[#818CF8] shadow-2xs hover:shadow transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear filters</span>
              </button>
            </div>
          ) : (
            /* Student Cards Grid */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {students.map((student) => {
                  const initial = student.name ? student.name[0].toUpperCase() : '?';
                  const isAvailable = student.availability === 'available';

                  return (
                    <div
                      key={student._id}
                      className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-card-hover transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Student Avatar + Name + Availability */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.name}
                                className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-indigo-50 dark:ring-indigo-950/40"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                {initial}
                              </div>
                            )}

                            <div className="truncate">
                              <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors truncate">
                                {student.name}
                              </h3>
                              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          {/* Availability Badge */}
                          <span
                            className={`shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>

                        {/* Academic Info: Branch & Year */}
                        <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263449] text-xs">
                          <div>
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                              Branch
                            </span>
                            <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                              {student.branch || 'General'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                              Year
                            </span>
                            <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                              {student.year ? `Year ${student.year}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Skills Badges */}
                        {student.skills && student.skills.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                              Skills
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {student.skills.slice(0, 4).map((skill, idx) => {
                                const skillName = skill.name || skill.skillId?.name;
                                return (
                                  <span
                                    key={skill.skillId?._id || skill.skillId || idx}
                                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 border border-[#E2E8F0] dark:border-[#263449]"
                                  >
                                    {skillName}
                                    {skill.level ? ` · L${skill.level}` : ''}
                                  </span>
                                );
                              })}
                              {student.skills.length > 4 && (
                                <span className="text-[11px] text-slate-400 self-center">
                                  +{student.skills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer: Role or Connection */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>Student</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] group-hover:translate-x-0.5 transition-transform">
                          <span>Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => loadStudents(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#111827] text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Page <strong className="text-[#0F172A] dark:text-[#F1F5F9]">{pagination.page}</strong> of{' '}
                    <strong className="text-[#0F172A] dark:text-[#F1F5F9]">{pagination.totalPages}</strong>
                  </span>
                  <button
                    onClick={() => loadStudents(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#111827] text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Students;
