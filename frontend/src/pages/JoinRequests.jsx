import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const JoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const projects = (await api.get('/projects?scope=my')).data.projects;
      const responses = await Promise.all(projects.map(async (project) => {
        const response = await api.get(`/projects/${project._id}/join-requests`);
        return response.data.requests;
      }));
      setRequests(responses.flat());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load join requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (requestId, decision) => {
    await api.patch(`/projects/join-requests/${requestId}/decision`, { decision });
    setRequests((current) => current.filter((request) => request._id !== requestId));
  };

  return <div className="min-h-screen bg-bg"><Navbar /><main className="max-w-4xl mx-auto px-6 py-10"><h1 className="text-3xl font-display font-700 text-ink">Join requests</h1><p className="text-sm text-ink/50 mt-1 mb-8">Review people asking to join your projects.</p>{error && <p className="text-sm text-coral mb-4">{error}</p>}{loading ? <p className="text-sm text-ink/40">Loading...</p> : requests.length === 0 ? <div className="glass-card rounded-2xl p-10 text-center text-sm text-ink/40">No pending join requests.</div> : <div className="space-y-3">{requests.map((request) => <div key={request._id} className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"><div className="flex items-center gap-3 flex-1">{request.userId?.avatarUrl ? <img src={request.userId.avatarUrl} alt={request.userId.name} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full bg-match/10 text-match flex items-center justify-center font-display font-700">{request.userId?.name?.[0]?.toUpperCase() || '?'}</div>}<div><p className="font-medium text-ink">{request.userId?.name}</p><p className="text-xs text-ink/50">{request.userId?.branch || 'No branch'} · Year {request.userId?.year || '—'}</p><div className="flex flex-wrap gap-1 mt-2">{request.userId?.skills?.map((skill) => <span key={skill.skillId} className="text-xs border border-border rounded px-2 py-0.5 text-ink/60">{skill.name} {skill.level ? `${skill.level}/5` : ''}</span>)}</div></div></div><div className="text-sm text-ink/60 md:w-48">Requested for <Link className="text-match hover:underline" to={`/projects/${request.projectId?._id}`}>{request.projectId?.title}</Link></div><div className="flex gap-2"><button onClick={() => decide(request._id, 'REJECTED')} className="text-xs px-3 py-2 rounded-md border border-border text-ink/60 hover:text-coral">Reject</button><button onClick={() => decide(request._id, 'ACCEPTED')} className="text-xs px-3 py-2 rounded-md bg-match text-bg">Accept</button></div></div>)}</div>}</main></div>;
};
export default JoinRequests;
