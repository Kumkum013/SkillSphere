import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const GitHubOAuthCallback = () => {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    api.post('/github/callback', {
      code: params.get('code'),
      state: params.get('state'),
      error: params.get('error')
    }).then((response) => {
      navigate(`/projects/${response.data.projectId}?tab=contributions&github=connected`, { replace: true });
    }).catch((err) => {
      const projectId = err.response?.data?.projectId;
      if (projectId) {
        navigate(`/projects/${projectId}?tab=contributions&github=error`, { replace: true });
        return;
      }
      setError(err.response?.data?.message || 'GitHub authorization could not be completed. Sign in and try again.');
    });
  }, [navigate]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <section className="glass-card max-w-lg rounded-2xl border border-slate-700/80 p-6 text-center">
        <h1 className="text-lg font-semibold text-white">Connecting GitHub</h1>
        {error
          ? <><p role="alert" className="mt-3 text-sm text-red-300">{error}</p><Link to="/login" className="mt-4 inline-block text-sm text-[#fca5a5]">Sign in</Link></>
          : <p className="mt-3 text-sm text-slate-400">Completing repository authorization…</p>}
      </section>
    </main>
  );
};

export default GitHubOAuthCallback;
