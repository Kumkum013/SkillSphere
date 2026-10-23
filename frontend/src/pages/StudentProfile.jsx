import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  MapPin,
  Sparkles,
  User,
  BadgeCheck
} from 'lucide-react';
import api from '../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data.student);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#64748B] dark:text-[#94A3B8]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error || 'Student not found'}</p>
          <Link to="/students" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block font-semibold">
            &larr; Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const initial = student.name ? student.name[0].toUpperCase() : '?';
  const isAvailable = student.availability === 'available';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6 sm:p-8 shadow-xs"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-6 border-b border-[#E2E8F0] dark:border-[#263449]">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-950/40"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-3xl flex items-center justify-center shadow-2xs">
                  {initial}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {student.name}
                  </h1>
                  <span
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] dark:text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {student.role || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263449] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    Branch
                  </span>
                </div>
                <p className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  {student.branch || 'Not specified'}
                </p>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263449] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    Year
                  </span>
                </div>
                <p className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  {student.year ? `Year ${student.year}` : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Skills Section */}
            {student.skills && student.skills.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, idx) => {
                    const skillName = skill.name || skill.skillId?.name;
                    return (
                      <div
                        key={skill.skillId?._id || skill.skillId || idx}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263449]"
                      >
                        <span className="font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                          {skillName}
                        </span>
                        {skill.level && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            L{skill.level}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GitHub Section */}
            {student.github && student.github.username && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    GitHub
                  </h2>
                </div>
                <a
                  href={student.github.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#24292F] hover:bg-[#1f2937] text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  @{student.github.username}
                </a>
              </div>
            )}
          </motion.div>
    </div>
  );
};

export default StudentProfile;
