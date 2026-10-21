import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-6">The application encountered an error. Please try refreshing the page.</p>
            
            {this.state.error && (
              <div className="bg-slate-900 rounded-xl p-4 mb-6 text-left overflow-auto max-h-64">
                <p className="text-red-400 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-slate-400 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-[#f87171] text-[#111827] px-6 py-3 rounded-xl font-semibold hover:bg-[#fb7185] transition-colors"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="ml-4 bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
