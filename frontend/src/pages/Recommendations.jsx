import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  Plus
} from 'lucide-react';
import { RecommendationsEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Recommendations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchNavQuery, setSearchNavQuery] = useState('');

  // Fetch notifications count for sidebar/top header
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  // Fetch recommended projects (Preserves existing API integration)
  useEffect(() => {
    setLoading(true);
    api.get('/projects/recommendations')
      .then((res) => setItems(res.data?.recommendations || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C1D] text-[#0F172A] dark:text-[#F5F7FF] transition-colors">
      {/* Recommendations Content Area */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading (Matching Visual Guide) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                Recommended projects
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Projects matched to the skills on your profile. Higher match scores indicate better alignment with your skills.
              </p>
            </div>
          </div>

          {/* Recommendations Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State Container (Matches Reference Image) */
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl min-h-[340px] sm:min-h-[380px] p-10 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
              <RecommendationsEmptyIllustration className="w-36 h-36 mb-2" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                No matching projects yet.
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1.5 mb-6 max-w-md mx-auto">
                Add more skills to improve your matches.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add skills to profile</span>
              </Link>
            </div>
          ) : (
            /* Populated Recommendations Grid */
            <motion.div
              initial="hidden"
              animate="show"
              variants={container}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {items.map(({ project, matchedSkills, matchScore }) => {
                const isEligible = matchScore >= (project.minMatchScore || 50);

                return (
                  <motion.div
                    key={project._id}
                    variants={item}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to={`/projects/${project._id}`}
                      className="group bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-card-hover transition-all flex flex-col justify-between h-full"
                    >
                      <div>
                        {/* Title, Match Score, Eligibility */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <h2 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors truncate">
                            {project.title}
                          </h2>

                          {/* Match Score Badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              {matchScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* Threshold Info */}
                        <div className="mb-2">
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            Minimum required: <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{project.minMatchScore || 50}%</span>
                            {isEligible ? (
                              <span className="ml-2 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 inline-flex">
                                <CheckCircle2 className="w-3 h-3" />
                                Eligible to apply
                              </span>
                            ) : (
                              <span className="ml-2 text-amber-600 dark:text-amber-400">
                                Below threshold
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-3">
                          {project.description || 'No description provided.'}
                        </p>

                        {/* Matching Skills */}
                        {matchedSkills && matchedSkills.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                              Your Matching Skills
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {matchedSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        {project.requiredSkills && project.requiredSkills.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                              All Required Skills
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {project.requiredSkills.slice(0, 4).map((s, idx) => (
                                <span
                                  key={s.skillId || idx}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#172033] text-slate-600 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#263449]"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {project.requiredSkills.length > 4 && (
                                <span className="text-[11px] text-slate-400 self-center">
                                  +{project.requiredSkills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer: Owner info, status, details action */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[120px]">{project.ownerId?.name || 'Project Owner'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {project.status || 'OPEN'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] group-hover:translate-x-0.5 transition-transform">
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
    </div>
  );
};

export default Recommendations;
