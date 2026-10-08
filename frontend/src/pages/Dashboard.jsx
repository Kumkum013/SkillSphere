import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListChecks, Mail, FolderOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <motion.div variants={item} className="glass-card hover-glow rounded-2xl p-5 shadow-soft relative overflow-hidden">
    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${gradient} opacity-20 blur-xl`} />
    <div className={`w-9 h-9 rounded-xl ${gradient} flex items-center justify-center mb-3 relative`}>
      <Icon className="w-4.5 h-4.5 text-white" />
    </div>
    <p className="text-2xl font-display font-700 text-ink relative">{value}</p>
    <p className="text-xs text-ink/50 relative">{label}</p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/my'),
      api.get('/invitations/my'),
      api.get('/projects?limit=4')
    ]).then(([tasksRes, invRes, projRes]) => {
      setTasks(tasksRes.data.tasks);
      setInvitations(invRes.data.invitations);
      setProjects(projRes.data.projects);
    }).finally(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const markCompleted = async (taskId) => {
    await api.put(`/tasks/${taskId}/status`, { status: 'COMPLETED' });
    setTasks((current) => current.map((task) => task._id === taskId ? { ...task, status: 'PENDING_REVIEW' } : task));
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-700 text-white mb-1">Hey {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm">Here's what's happening across your projects.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl glass-card hover-glow animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={ListChecks} label="Active tasks" value={activeTasks.length} gradient="bg-gradient-to-br from-match to-match2" />
              <StatCard icon={CheckCircle2} label="Completed" value={completedCount} gradient="bg-gradient-to-br from-success to-emerald-400" />
              <StatCard icon={Mail} label="Invitations" value={invitations.length} gradient="bg-gradient-to-br from-coral to-orange-400" />
              <StatCard icon={FolderOpen} label="Open projects" value={projects.length} gradient="bg-gradient-to-br from-match2 to-purple-400" />
            </motion.div>

            <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.section variants={item} className="lg:col-span-2 glass-card hover-glow rounded-2xl p-6 shadow-soft">
                <h2 className="font-display font-600 text-ink mb-4 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-match" /> Your tasks
                </h2>
                {activeTasks.length === 0 ? (
                  <p className="text-sm text-ink/40 py-6 text-center">No tasks assigned yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {activeTasks.map((t) => (
                      <li key={t._id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.projectId?.title}</p>
                          <p className="text-xs text-slate-400 mt-1">Assigned by {t.assignedBy?.name || 'Project owner'}{t.requiredSkill ? ` · ${t.requiredSkill}` : ''}{t.deadline ? ` · Due ${new Date(t.deadline).toLocaleDateString()}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' :
                          t.status === 'PENDING_REVIEW' ? 'bg-[#f87171]/10 text-[#fca5a5] border border-[#f87171]/20' :
                          t.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-400/20' :
                          'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>{t.status !== 'PENDING_REVIEW' && <button onClick={() => markCompleted(t._id)} className="text-xs text-[#f87171] hover:text-[#fca5a5] hover:underline">Mark completed</button>}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>

              <motion.section variants={item} className="glass-card hover-glow rounded-2xl p-6 shadow-soft">
                <h2 className="font-display font-600 text-ink mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-coral" /> Pending invitations
                </h2>
                {invitations.length === 0 ? (
                  <p className="text-sm text-ink/40 py-6 text-center">No pending invitations.</p>
                ) : (
                  <ul className="space-y-3">
                    {invitations.map((inv) => (
                      <li key={inv._id} className="text-sm p-3 rounded-xl bg-bg">
                        <p className="font-medium text-ink">{inv.projectId?.title}</p>
                        <Link to="/invitations" className="text-match text-xs font-medium inline-flex items-center gap-1 mt-1">
                          Respond <ArrowRight className="w-3 h-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>

              <motion.section variants={item} className="lg:col-span-3 glass-card hover-glow rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-600 text-ink flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-match2" /> Open projects
                  </h2>
                  <Link to="/projects" className="text-match text-sm font-medium inline-flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <motion.div key={p._id} whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
                      <Link to={`/projects/${p._id}`}
                        className="block border border-border rounded-xl p-4 hover:border-match hover:shadow-soft transition-all">
                        <p className="font-medium text-ink text-sm">{p.title}</p>
                        <p className="text-xs text-ink/50 mt-1 line-clamp-2">{p.description}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
