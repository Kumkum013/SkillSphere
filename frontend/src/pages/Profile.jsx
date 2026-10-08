import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Zap, Upload, FileText, Users, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import SkillDots from '../components/SkillDots';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState(3);
  const [error, setError] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeMatches, setResumeMatches] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeProgress, setResumeProgress] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [requestingProjectId, setRequestingProjectId] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestNotice, setRequestNotice] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [githubMessage, setGithubMessage] = useState('');
  const [githubError, setGithubError] = useState('');

  const loadProfile = () => {
    api.get('/students/profile').then((res) => {
      setProfile(res.data.user);
      setGithubUsername(res.data.user.githubUsername || '');
    });
  };

  useEffect(() => { loadProfile(); }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    if (!skillName.trim()) return;
    try {
      await api.post('/students/skills', { skillName, level: Number(level) });
      setSkillName('');
      setLevel(3);
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    await api.delete(`/students/skills/${skillId}`);
    loadProfile();
  };

  const handleAvailability = async (val) => {
    await api.put('/students/profile', { availability: val });
    loadProfile();
  };

  const saveGithubUsername = async (event) => {
    event.preventDefault();
    setGithubError('');
    setGithubMessage('');
    try {
      const response = await api.put('/students/profile', { githubUsername });
      setProfile(response.data.user);
      setGithubUsername(response.data.user.githubUsername || '');
      setGithubMessage('GitHub username saved.');
    } catch (err) {
      setGithubError(err.response?.data?.message || 'Could not save GitHub username.');
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setResumeError('');
    setResumeProgress('');
    setRequestError('');
    setResumeSkills([]);
    setResumeMatches([]);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Please upload a PDF resume.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeError('Resume must be smaller than 10 MB.');
      return;
    }

    setResumeLoading(true);
    setResumeName(file.name);
    try {
      const [pdfjsLib, workerModule] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      ]);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pageText = [];
      let ocrWorker = null;
      let ocrPageCount = 0;
      try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          setResumeProgress(`Reading PDF page ${pageNumber} of ${pdf.numPages}…`);
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ').trim();

          if (text.length < 40) {
            if (!ocrWorker) {
              setResumeProgress('Scanned pages found. Preparing browser-based OCR…');
              const { createWorker } = await import('tesseract.js');
              ocrWorker = await createWorker('eng', 1, {
                logger: (message) => {
                  if (message.status === 'recognizing text') {
                    setResumeProgress(`Recognizing scanned page ${ocrPageCount + 1}… ${Math.round(message.progress * 100)}%`);
                  } else if (message.status === 'loading language traineddata') {
                    setResumeProgress('Downloading OCR language data…');
                  }
                }
              });
            }

            ocrPageCount += 1;
            setResumeProgress(`Recognizing scanned page ${ocrPageCount}…`);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            await page.render({ canvas, viewport }).promise;
            const result = await ocrWorker.recognize(canvas);
            pageText.push(result.data.text || '');
            canvas.width = 0;
            canvas.height = 0;
          } else {
            pageText.push(text);
          }
        }
      } finally {
        if (ocrWorker) await ocrWorker.terminate();
      }
      const resumeText = pageText.join('\n').trim();
      if (!resumeText) {
        throw new Error('No readable text was found. Check that the PDF is clear and try again.');
      }
      if (new TextEncoder().encode(resumeText).byteLength > 80 * 1024) {
        throw new Error('Extracted resume text is too large to analyze. Try a shorter PDF.');
      }

      setResumeProgress('Matching extracted skills to projects…');
      const response = await api.post('/students/resume-matches', { resumeText });
      setResumeSkills(response.data.detectedSkills || []);
      setResumeMatches(response.data.recommendations || []);
    } catch (err) {
      setResumeError(err.response?.data?.message || err.message || 'Could not analyze this resume.');
    } finally {
      setResumeLoading(false);
      setResumeProgress('');
    }
  };

  const requestToJoin = async (projectId) => {
    setRequestingProjectId(projectId);
    setRequestError('');
    setRequestNotice('');
    try {
      const response = await api.post(`/projects/${projectId}/join-request`);
      setResumeMatches((current) => current.map((match) => (
        match.project._id === projectId ? { ...match, joinRequestStatus: 'PENDING' } : match
      )));
      setRequestNotice(response.data.emailSent
        ? 'Join request sent, and the project owner was emailed.'
        : 'Join request was saved, but the project owner email could not be delivered.');
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not send the join request.');
    } finally {
      setRequestingProjectId('');
    }
  };

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card hover-glow rounded-2xl p-6 shadow-soft mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f87171] to-[#fb7185] flex items-center justify-center text-white text-2xl font-display font-700 shadow-glow">
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-display font-700 text-white">{profile.name}</h1>
              <p className="text-slate-400 text-sm">{profile.email}</p>
              <p className="text-slate-500 text-xs mt-0.5">{profile.branch || 'No branch set'} · Year {profile.year || '—'}</p>
            </div>
          </div>
          <button
            onClick={() => handleAvailability(!profile.availability)}
            className={`text-xs font-medium px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5 border ${
              profile.availability ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${profile.availability ? 'bg-emerald-300' : 'bg-slate-400'}`} />
            {profile.availability ? 'Available' : 'Not available'}
          </button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card hover-glow rounded-2xl p-6 shadow-soft mt-6"
        >
          <h2 className="font-display font-600 text-white">GitHub account</h2>
          <p className="text-sm text-slate-400 mt-1">Add your GitHub username so project owners can match your commits to your SkillSphere profile.</p>
          <form onSubmit={saveGithubUsername} className="flex flex-wrap items-end gap-3 mt-4">
            <label className="flex-1 min-w-48 text-xs font-medium text-slate-300">
              GitHub username
              <input
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                placeholder="e.g. octocat"
                maxLength={39}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-4 focus:ring-match/10 focus:border-match text-sm"
              />
            </label>
            <button type="submit" className="rounded-xl bg-match px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90">
              Save username
            </button>
          </form>
          {githubError && <p role="alert" className="text-xs text-coral mt-2">{githubError}</p>}
          {githubMessage && <p role="status" className="text-xs text-emerald-300 mt-2">{githubMessage}</p>}
        </motion.section>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card hover-glow rounded-2xl p-6 shadow-soft"
        >
          <h2 className="font-display font-600 text-ink mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-match" /> Your skills
          </h2>

          {profile.skills.length === 0 ? (
            <p className="text-sm text-ink/40 mb-4 py-4 text-center">No skills added yet — add your first one below.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-5">
              <AnimatePresence>
                {profile.skills.map((s) => (
                  <motion.div
                    key={s.skillId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-bg border border-border hover:border-match/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-ink">{s.name}</span>
                    <SkillDots level={s.level} />
                    <button
                      onClick={() => handleRemoveSkill(s.skillId)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-ink/30 hover:text-coral hover:bg-coral/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <form onSubmit={handleAddSkill} className="flex items-end gap-3 pt-4 border-t border-border">
            <div className="flex-1">
              <label className="text-xs font-medium text-ink/60">Skill name</label>
              <input
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. React"
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-ink focus:outline-none focus:ring-4 focus:ring-match/10 focus:border-match text-sm transition-all"
              />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium text-ink/60">Level (1-5)</label>
              <input
                type="number" min="1" max="5"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-ink focus:outline-none focus:ring-4 focus:ring-match/10 focus:border-match text-sm transition-all"
              />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} type="submit"
              className="bg-match text-bg text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </motion.button>
          </form>
          {error && <p className="text-xs text-coral mt-2">{error}</p>}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card hover-glow rounded-2xl p-6 shadow-soft mt-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-600 text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-match" /> Resume skill match
              </h2>
              <p className="text-sm text-slate-400 mt-1">Upload a PDF to find your skills and match them to open projects. Scanned pages use browser-based OCR.</p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-xl bg-match px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 cursor-pointer">
              <Upload className="w-4 h-4" /> {resumeLoading ? 'Analyzing...' : 'Upload resume'}
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleResumeUpload}
                disabled={resumeLoading}
                className="sr-only"
              />
            </label>
          </div>

          {resumeName && <p className="text-xs text-slate-400 mb-4">Resume: {resumeName}</p>}
          {resumeLoading && <p role="status" className="text-sm text-match">{resumeProgress || 'Extracting resume text and finding project matches…'}</p>}
          {resumeError && <p role="alert" className="text-sm text-coral mb-4">{resumeError}</p>}

          {resumeSkills.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Skills found in your resume</p>
              <div className="flex flex-wrap gap-2">
                {resumeSkills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {resumeMatches.length > 0 && (
            <div className="space-y-3 border-t border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-match" /> Project matches
              </h3>
              {resumeMatches.map(({ project, matchScore, matchedSkills, missingSkills, joinRequestStatus }) => (
                <article key={project._id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-white">{project.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-emerald-300">{matchScore}% match</span>
                      {joinRequestStatus === 'PENDING' ? (
                        <span className="text-xs px-3 py-2 rounded-lg border border-amber-500/30 text-amber-300">Request pending</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestToJoin(project._id)}
                          disabled={requestingProjectId === project._id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-[#f87171] text-[#111827] hover:opacity-90 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {requestingProjectId === project._id ? 'Sending…' : joinRequestStatus === 'REJECTED' ? 'Request again' : 'Request to join'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {matchedSkills.map((skill) => (
                      <span key={skill} className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">{skill}</span>
                    ))}
                    {missingSkills.map((skill) => (
                      <span key={skill} className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">{skill}</span>
                    ))}
                  </div>
                  {matchScore < project.minMatchScore && (
                    <p className="text-[11px] text-amber-300 mt-2">Below the project’s recommended {project.minMatchScore}% match threshold.</p>
                  )}
                </article>
              ))}
            </div>
          )}
          {requestError && <p role="alert" className="text-xs text-coral mt-3">{requestError}</p>}
          {requestNotice && <p role="status" className={`text-xs mt-3 ${requestNotice.includes('could not') ? 'text-amber-300' : 'text-emerald-300'}`}>{requestNotice}</p>}
          {!resumeLoading && resumeName && resumeSkills.length === 0 && !resumeError && (
            <p className="text-sm text-slate-400">No catalogued skills detected in this resume.</p>
          )}
          {!resumeLoading && resumeSkills.length > 0 && resumeMatches.length === 0 && (
            <p className="text-sm text-slate-400 mt-4">No open project matches found. Add skills to the catalog or check back later.</p>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;
