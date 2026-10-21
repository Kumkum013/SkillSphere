import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, FolderKanban } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const Recommendations = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/projects/recommendations').then((res) => setItems(res.data.recommendations)); }, []);
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-[#f87171]" />
          <h1 className="text-3xl font-display font-700 text-white">Recommended projects</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1 mb-8">Projects matched to the skills on your profile. Higher match scores indicate better alignment with your skills.</p>
        {items.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center shadow-soft">
            <FolderKanban className="w-10 h-10 text-ink/20 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No matching projects yet. Add more skills to improve your matches.</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={container} className="grid md:grid-cols-2 gap-4">
            {items.map(({ project, matchedSkills, matchScore }) => (
              <motion.div key={project._id} variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                <Link to={`/projects/${project._id}`} className="block glass-card hover-glow rounded-2xl p-5 hover:border-[#f87171]/40 hover:shadow-[0_18px_38px_rgba(15,23,42,0.35)] transition-all h-full">
                  <div className="flex justify-between gap-4 items-start mb-3">
                    <h2 className="font-display font-600 text-white flex-1">{project.title}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-700 text-sm text-white flex-shrink-0"
                        style={{ background: `conic-gradient(#10b981 ${matchScore * 3.6}deg, #334155 0deg)` }}>
                        <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-700">
                          {matchScore}%
                        </div>
                      </div>
                      {matchScore >= (project.minMatchScore || 50) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">Eligible</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2 mb-4">{project.description}</p>
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-2">Your matching skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((skill) => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Owner: {project.ownerId?.name || 'Unknown'}</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">{project.status}</span>
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
export default Recommendations;
