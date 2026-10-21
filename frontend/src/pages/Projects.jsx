import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FolderKanban, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [scope, setScope] = useState('my');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skills: '', minMatchScore: 50 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProjects = () => {
    console.log('Loading projects with scope:', scope);
    setLoading(true);
    api.get(`/projects?scope=${scope}`)
      .then((res) => {
        console.log('Projects loaded:', res.data.projects);
        setProjects(res.data.projects || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setProjects([]);
        setLoading(false);
      });
  };

  useEffect(() => { loadProjects(); }, [scope]);

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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-700 text-white">Projects</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your projects and see the teams you joined.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-[#f87171] text-[#111827] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#fb7185] transition-colors flex items-center gap-1.5 shadow-[0_10px_24px_rgba(248,113,113,0.24)]"
          >
            {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New project</>}
          </motion.button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-1">
          {['my', 'joined', 'all'].map((value) => <button key={value} onClick={() => setScope(value)} className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${scope === value ? 'text-[#f87171] border-b-2 border-[#f87171]' : 'text-slate-400 hover:text-slate-200'}`}>{value === 'my' ? 'My projects' : value === 'joined' ? 'Joined projects' : 'All projects'}</button>)}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="glass-card hover-glow rounded-2xl p-6 mb-8 space-y-4 shadow-soft overflow-hidden"
            >
              {error && <div className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">{error}</div>}
              <div>
                <label className="text-xs font-medium text-slate-300">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#f87171]/20 focus:border-[#f87171] text-sm transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Description</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#f87171]/20 focus:border-[#f87171] text-sm transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Required skills (comma-separated)</label>
                <input required placeholder="React, Java, UI/UX" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#f87171]/20 focus:border-[#f87171] text-sm transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">Minimum match score for invitations ({form.minMatchScore}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.minMatchScore}
                  onChange={(e) => setForm({ ...form, minMatchScore: parseInt(e.target.value) })}
                  className="w-full accent-[#f87171]"
                />
                <p className="text-xs text-slate-400 mt-1">Candidates with this score or higher will be recommended for invitations</p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
                className="bg-[#f87171] text-[#111827] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#fb7185] transition-colors disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create project'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="glass-card hover-glow rounded-2xl p-12 text-center shadow-soft">
            <p className="text-sm text-ink/40">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card hover-glow rounded-2xl p-12 text-center shadow-soft">
            <FolderKanban className="w-10 h-10 text-ink/20 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No open projects yet. Be the first to post one.</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <motion.div key={p._id} variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                <Link to={`/projects/${p._id}`}
                  className="block glass-card hover-glow rounded-2xl p-5 hover:border-match hover:shadow-soft transition-all h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-600 text-ink">{p.title}</h3>
                    <div className="flex items-center gap-2">
                      {scope === 'all' && p.matchScore !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-display font-700 text-sm text-white flex-shrink-0"
                            style={{ background: `conic-gradient(#10b981 ${p.matchScore * 3.6}deg, #334155 0deg)` }}>
                            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-700">
                              {p.matchScore}%
                            </div>
                          </div>
                          {p.matchScore >= (p.minMatchScore || 50) && (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">Eligible</span>
                          )}
                        </div>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-match/10 text-match font-medium">{p.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-ink/50 line-clamp-2 mb-3">{p.description}</p>
                  {scope === 'all' && p.matchedSkills && p.matchedSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-2">Your matching skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.matchedSkills.map((skill) => (
                          <span key={skill} className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.requiredSkills.map((s) => (
                      <span key={s.skillId} className="text-xs px-2.5 py-1 rounded-full border border-border text-ink/60">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Projects;
