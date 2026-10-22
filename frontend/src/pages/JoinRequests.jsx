import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { JoinRequestsEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const JoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const projects = (await api.get('/projects?scope=my')).data.projects;
      const responses = await Promise.all(
        projects.map(async (project) => {
          const response = await api.get(`/projects/${project._id}/join-requests`);
          return response.data.requests;
        })
      );
      setRequests(responses.flat());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load join requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (requestId, decision) => {
    setError('');
    setNotice('');
    try {
      const response = await api.patch(`/projects/join-requests/${requestId}/decision`, { decision });
      setRequests((current) => current.filter((request) => request._id !== requestId));
      setNotice(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the join request');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B1B] text-[#F5F7FF] relative overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient Atmospheric Glows */}
      {/* Bottom-left glow with concentric arcs matching reference image */}
      <div className="absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-900/35 via-purple-900/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-indigo-500/5 pointer-events-none" />

      {/* Top-right subtle glow */}
      <div className="absolute -top-36 -right-36 w-[460px] h-[460px] rounded-full bg-gradient-to-bl from-purple-900/25 via-indigo-950/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FF]">
            Join requests
          </h1>
          <p className="text-sm sm:text-base text-[#94A3C8] mt-1.5">
            Review people asking to join your projects.
          </p>
        </div>

        {/* Error / Notice Banners */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 text-sm flex items-center gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-2.5 shadow-sm ${
              notice.includes('email could not')
                ? 'border-amber-500/30 bg-amber-950/40 text-amber-200'
                : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Content Body: Loading, Empty State, or Request Cards */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm text-[#94A3C8]">Loading join requests...</p>
          </div>
        ) : requests.length === 0 ? (
          /* Empty State matching the reference image */
          <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-16 text-center my-auto">
            <JoinRequestsEmptyIllustration className="w-72 sm:w-84 h-64 sm:h-72 mb-3" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              You&apos;re all caught up!
            </h2>

            <p className="text-sm sm:text-base text-[#94A3C8] max-w-[430px] mx-auto mt-2.5 leading-relaxed">
              New project join requests will appear here when someone asks to join your projects.
            </p>

            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-indigo-500/40 bg-[#0B1225]/80 hover:bg-[#121B38] hover:border-indigo-400 text-sm font-medium text-white shadow-sm hover:shadow-indigo-500/20 transition-all mt-6 group"
            >
              <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
              <span>Explore projects</span>
            </Link>
          </div>
        ) : (
          /* Populated Join Requests */
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-[#101831] border border-indigo-500/20 hover:border-indigo-500/35 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-sm shadow-indigo-950/20"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {request.userId?.avatarUrl ? (
                    <img
                      src={request.userId.avatarUrl}
                      alt={request.userId.name}
                      className="w-12 h-12 rounded-full object-cover border border-indigo-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      {request.userId?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-base">
                        {request.userId?.name || 'Anonymous Student'}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-[#A5B4FC]">
                        {request.userId?.branch || 'General'}{' '}
                        {request.userId?.year ? `· Year ${request.userId.year}` : ''}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#94A3C8]">
                      Requested to join:{' '}
                      <Link
                        to={`/projects/${request.projectId?._id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <span>{request.projectId?.title || 'Project'}</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </Link>
                    </p>

                    {request.message && (
                      <p className="text-xs text-slate-300 bg-[#070B1B]/70 border border-indigo-500/15 p-2.5 rounded-xl mt-2 italic">
                        &ldquo;{request.message}&rdquo;
                      </p>
                    )}

                    {request.userId?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {request.userId.skills.map((skill) => (
                          <span
                            key={skill.skillId || skill.name}
                            className="text-[11px] font-medium border border-indigo-500/20 bg-indigo-950/40 text-indigo-200 rounded-md px-2 py-0.5"
                          >
                            {skill.name} {skill.level ? `(${skill.level}/5)` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Reject & Accept */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => decide(request._id, 'REJECTED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 hover:border-rose-500/50 bg-[#070B1B] hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(request._id, 'ACCEPTED')}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinRequests;
