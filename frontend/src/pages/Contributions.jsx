import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitCommit, GitPullRequest, AlertCircle, CheckCircle, TrendingUp, BarChart3, Github, ExternalLink, ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Contributions = () => {
  const { id, projectId: paramProjectId } = useParams();
  const projectId = id || paramProjectId;

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (projectId) {
      loadProject();
      fetchSummary();
      fetchContributions();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.project);
      if (res.data.project?.githubRepo?.url) {
        setRepoUrl(res.data.project.githubRepo.url);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/contributions/projects/${projectId}/summary`);
      setSummary(response.data.summary || []);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setSummary([]);
    }
  };

  const fetchContributions = async () => {
    try {
      const response = await api.get(`/contributions/projects/${projectId}`);
      setContributions(response.data.contributions || []);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  const syncContributions = async () => {
    setSyncing(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await api.post(`/contributions/projects/${projectId}/sync`);
      await fetchSummary();
      await fetchContributions();
      await loadProject();
      setStatusMessage({
        type: 'success',
        text: res.data.message || `Contributions synced successfully! (${res.data.contributionsAdded} new)`
      });
    } catch (error) {
      console.error('Failed to sync:', error);
      const errMsg = error.response?.data?.message || 'Failed to sync contributions. Make sure team members have linked their GitHub accounts in Profile.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setSyncing(false);
    }
  };

  const linkRepo = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) return;

    setStatusMessage({ type: '', text: '' });
    try {
      const res = await api.post(`/contributions/projects/${projectId}/link-repo`, { repoUrl: repoUrl.trim() });
      setShowLinkModal(false);
      setProject(res.data.project);
      setStatusMessage({ type: 'success', text: 'GitHub repository linked successfully!' });
      // Automatically trigger sync right after linking
      syncContributions();
    } catch (error) {
      console.error('Failed to link repo:', error);
      const msg = error.response?.data?.message || 'Failed to link repository. Please check the URL format (e.g. https://github.com/owner/repo).';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  const getContributionIcon = (type) => {
    switch (type) {
      case 'COMMIT':
        return <GitCommit className="w-4 h-4 text-blue-400" />;
      case 'PULL_REQUEST':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'ISSUE':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getContributionColor = (type) => {
    switch (type) {
      case 'COMMIT':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'PULL_REQUEST':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'ISSUE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isRepoLinked = Boolean(project?.githubRepo?.owner && project?.githubRepo?.repoName);

  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-slate-700/80 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-700 text-white">
                  {project?.title ? `${project.title} · GitHub Contributions` : 'GitHub Contributions'}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Track code commits, pull requests, and member contributions directly from GitHub.
                </p>
              </div>
            </div>

            {isRepoLinked && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700 w-fit">
                <span className="text-slate-400">Linked Repository:</span>
                <a
                  href={project.githubRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f87171] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {project.githubRepo.owner}/{project.githubRepo.repoName}
                  <ExternalLink className="w-3 h-3" />
                </a>
                {project.githubRepo.lastSyncedAt && (
                  <span className="text-slate-500 ml-2">
                    · Last synced {new Date(project.githubRepo.lastSyncedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              {isRepoLinked ? 'Change Repo' : 'Link GitHub Repo'}
            </button>
            <button
              onClick={syncContributions}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-[#f87171] hover:bg-[#fb7185] text-[#111827] text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#f87171]/20"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync GitHub'}
            </button>
          </div>
        </div>

        {/* Notifications / alerts */}
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border text-sm ${
              statusMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}

        {!isRepoLinked && (
          <div className="glass-card rounded-2xl p-8 mb-6 border border-amber-500/30 bg-amber-500/5 text-center">
            <Github className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">No GitHub repository linked to this project</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Link your team's GitHub repository to automatically import commits, pull requests, and activity logs.
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#f87171] text-[#111827] text-sm font-semibold hover:bg-[#fb7185] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Link Repository Now
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/80 pb-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Leaderboard & Summary
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-4 h-4 inline mr-2" />
            All Contributions ({contributions.length})
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-slate-700/80">
                <p className="text-xs uppercase tracking-wider text-slate-400">Total Contributors</p>
                <p className="text-3xl font-bold text-white mt-1">{summary ? summary.length : 0}</p>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-slate-700/80">
                <p className="text-xs uppercase tracking-wider text-slate-400">Total Contributions</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {summary ? summary.reduce((acc, s) => acc + (s.totalContributions || 0), 0) : 0}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-slate-700/80">
                <p className="text-xs uppercase tracking-wider text-slate-400">Team Score</p>
                <p className="text-3xl font-bold text-emerald-300 mt-1">
                  {summary ? summary.reduce((acc, s) => acc + (s.totalScore || 0), 0) : 0}
                </p>
              </div>
            </div>

            {/* Rankings */}
            <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
              <div className="p-5 border-b border-slate-700/80">
                <h2 className="text-lg font-semibold text-white">Contributor Leaderboard</h2>
              </div>

              {!summary || summary.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No contributions recorded yet. Ensure repository is linked and click "Sync GitHub".
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {summary.map((user, index) => (
                    <div key={user.userId} className="p-5 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`text-xl font-bold w-6 ${index === 0 ? 'text-amber-300' : index === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                            #{index + 1}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-white border border-slate-700">
                            {user.userDetails?.avatarUrl ? (
                              <img src={user.userDetails.avatarUrl} alt={user.userName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.userName?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{user.userName}</h3>
                            <p className="text-xs text-slate-400">{user.userDetails?.email}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-400">{user.totalScore}</p>
                          <p className="text-[11px] text-slate-400">points</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                        <div>
                          <p className="text-sm font-semibold text-white">{user.totalContributions}</p>
                          <p className="text-[10px] uppercase text-slate-400">Total</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-400">{user.contributionsByType?.COMMIT || 0}</p>
                          <p className="text-[10px] uppercase text-slate-400">Commits</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-purple-400">{user.contributionsByType?.PULL_REQUEST || 0}</p>
                          <p className="text-[10px] uppercase text-slate-400">PRs</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-400">{user.contributionsByType?.ISSUE || 0}</p>
                          <p className="text-[10px] uppercase text-slate-400">Issues</p>
                        </div>
                      </div>

                      {user.recentActivity?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                          {user.recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                              <span className="flex items-center gap-1.5 truncate max-w-md">
                                {getContributionIcon(act.type)}
                                <span className="truncate">{act.title}</span>
                              </span>
                              <span className="text-emerald-400 font-medium">+{act.score} pts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
            <div className="p-5 border-b border-slate-700/80">
              <h2 className="text-lg font-semibold text-white">All Logged Contributions</h2>
            </div>

            {contributions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No contributions logged yet. Click "Sync GitHub" to pull commits and PRs.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {contributions.map((c) => (
                  <div key={c._id} className="p-5 hover:bg-slate-800/30 transition-colors flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`p-2 rounded-xl border ${getContributionColor(c.contributionType)}`}>
                        {getContributionIcon(c.contributionType)}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                        {c.description && c.description !== c.title && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{c.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">{c.userName} (@{c.githubUsername})</span>
                          <span>•</span>
                          <span>{new Date(c.githubCreatedAt || c.createdAt).toLocaleDateString()}</span>
                          {c.url && (
                            <>
                              <span>•</span>
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#f87171] hover:underline inline-flex items-center gap-1"
                              >
                                View on GitHub <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-400">+{c.contributionScore} pts</span>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{c.contributionType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Github className="w-5 h-5 text-white" /> Link GitHub Repository
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Enter the full URL of the public or authorized GitHub repository for this project.
              </p>

              <form onSubmit={linkRepo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Repository URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f87171] placeholder:text-slate-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#f87171] hover:bg-[#fb7185] text-[#111827] text-sm font-semibold transition-colors"
                  >
                    Save & Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Contributions;
