import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setStudents(res.data.students);
      setPagination(res.data.pagination);
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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-[#f87171]" />
          <div>
            <h1 className="text-3xl font-display font-700 text-white">Browse Students</h1>
            <p className="text-slate-400 text-sm mt-1">Find students with specific skills and experience</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6 shadow-soft border border-slate-700/80">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#f87171]" />
            <h3 className="text-base font-semibold text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Search by name/email</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Skill</label>
              <input
                type="text"
                placeholder="e.g., React, Java"
                value={filters.skill}
                onChange={(e) => handleFilterChange('skill', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
              >
                <option value="">All years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Branch</label>
              <input
                type="text"
                placeholder="e.g., CSE, ECE"
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f87171]/25 focus:border-[#f87171]"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-2xl p-4 mb-6 border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center shadow-soft">
            <p className="text-sm text-slate-400">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center shadow-soft">
            <Users className="w-10 h-10 text-ink/20 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No students found matching your filters.</p>
          </div>
        ) : (
          <>
            <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {students.map((student) => (
                <motion.div key={student._id} variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                  <div className="glass-card hover-glow rounded-2xl p-5 hover:border-[#f87171]/40 hover:shadow-soft transition-all h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#fbb4b4] text-[#7f1d1d] flex items-center justify-center font-display font-600 text-sm">
                        {student.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{student.name}</h3>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[11px] text-slate-400">Branch</p>
                        <p className="text-sm text-slate-200">{student.branch || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Year</p>
                        <p className="text-sm text-slate-200">{student.year || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-[11px] text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills?.slice(0, 4).map((skill) => (
                          <span key={skill.skillId?._id || skill.skillId} className="text-xs px-2 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                            {skill.name || skill.skillId?.name}
                          </span>
                        ))}
                        {student.skills?.length > 4 && (
                          <span className="text-xs px-2 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
                            +{student.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${student.availability === 'available' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' : 'bg-amber-500/10 text-amber-300 border border-amber-400/20'}`}>
                        {student.availability === 'available' ? 'Available' : student.availability === 'busy' ? 'Busy' : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => loadStudents(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => loadStudents(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Students;
