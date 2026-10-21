import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Full reload to initialize auth state cleanly or navigate to dashboard
      window.location.href = '/dashboard';
    } else if (error) {
      console.error('OAuth authentication error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#f87171] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Completing GitHub authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
