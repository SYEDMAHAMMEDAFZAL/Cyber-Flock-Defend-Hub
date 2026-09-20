import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cyber Flock Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#04070a] text-slate-100 flex flex-col items-center justify-center p-6 cyber-grid select-none">
          <div className="w-full max-w-lg bg-[#060b0e] border border-rose-500/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-mono font-bold text-white tracking-wider mb-2">
              DEFENSE CONSOLE RECOVERY
            </h2>

            <p className="text-xs font-mono text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              The defense interface intercepted a UI rendering anomaly. All backend security monitoring, telemetry, and threat simulations remain active.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-[#030608] border border-slate-800/80 text-left font-mono text-[11px] text-rose-300/90 overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Console</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0a1418] hover:bg-[#102027] border border-[#18262a] text-slate-200 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
