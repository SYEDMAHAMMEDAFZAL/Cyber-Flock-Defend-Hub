import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('admin@cyberflock.defense', 'AdminSecurePassword123!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('SuperAdmin Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setGoogleLoading(true);
    setError('');
    try {
      await googleLogin({
        email: customGoogleEmail,
        name: customGoogleName || customGoogleEmail.split('@')[0],
        token: `google_oauth_token_${Date.now()}`,
      });
      setShowGoogleModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign In failed:', err);
      setError(err.response?.data?.detail || 'Google authentication encountered an issue.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030608] flex items-center justify-center p-4">
      {/* Background abstract elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center z-10">
        
        {/* Left Side: Brand & Logo */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 pr-12">
          <div className="relative group perspective-1000">
            <img 
              src="/cyber_flock_logo.jpg" 
              alt="Cyber Flock Enterprise" 
              className="w-64 h-64 object-contain mix-blend-screen hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-sans font-bold text-white tracking-tight">
              CYBER <span className="text-emerald-400">FLOCK</span>
            </h1>
            <h2 className="text-sm font-mono text-slate-400 tracking-[0.2em] uppercase">
              Enterprise Defense Hub
            </h2>
            <p className="text-slate-400 font-sans leading-relaxed text-sm max-w-md mt-4">
              Advanced breach simulation, predictive financial loss calculation, and optimized defense budget allocation powered by AI and Hyperledger Fabric.
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Block */}
        <div className="bg-[#070d11]/85 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden p-8 sm:p-12">
          
          <div className="mb-8">
            <h2 className="text-2xl font-sans font-semibold text-white tracking-tight mb-2">
              System Access
            </h2>
            <p className="text-sm text-slate-400 font-sans">
              Authenticate to access the global defense grid.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-400 font-sans leading-relaxed">{error}</p>
            </div>
          )}

          {/* Super Admin Quick Login */}
          <button
            onClick={handleSuperAdminLogin}
            disabled={loading}
            className="w-full relative group mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center justify-between bg-[#0a1418] hover:bg-[#0c1a1f] border border-emerald-500/30 p-4 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-sans font-semibold text-white">Super Administrator</h3>
                  <p className="text-xs text-slate-400 font-sans">Global tenant oversight & controls</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <div className="relative flex items-center py-4 mb-6">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
              Standard Access
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a1418] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a1418] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-slate-200 font-sans font-semibold text-sm py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* New User / Google */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setShowGoogleModal(true)}
              className="w-full flex items-center justify-center gap-3 bg-[#0a1418] hover:bg-[#0f1d24] border border-white/10 text-white font-sans text-sm font-medium py-3 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up / Sign in with Google
            </button>
          </div>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MOCK MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-[400px] w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="px-8 pt-8 pb-4 text-center">
              <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="font-sans text-[22px] text-slate-900 font-normal">Choose an account</h3>
              <p className="text-slate-600 text-sm mt-2">to continue to <strong className="font-medium text-slate-900">Cyber Flock</strong></p>
            </div>
            
            <div className="border-t border-b border-slate-200 py-1">
              <button 
                type="button"
                onClick={() => {
                  setCustomGoogleEmail('ciso@cyberflock.defense');
                  setCustomGoogleName('Cyber CISO');
                  handleGoogleSignIn({ preventDefault: () => {} });
                }}
                className="w-full flex items-center gap-4 px-8 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  C
                </div>
                <div>
                  <div className="text-slate-900 text-sm font-medium">Cyber CISO</div>
                  <div className="text-slate-500 text-sm">ciso@cyberflock.defense</div>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setCustomGoogleEmail('analyst@cyberflock.defense');
                  setCustomGoogleName('Security Analyst');
                  handleGoogleSignIn({ preventDefault: () => {} });
                }}
                className="w-full flex items-center gap-4 px-8 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  S
                </div>
                <div>
                  <div className="text-slate-900 text-sm font-medium">Security Analyst</div>
                  <div className="text-slate-500 text-sm">analyst@cyberflock.defense</div>
                </div>
              </button>
            </div>

            <div className="px-8 py-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Cancel
              </button>
              
              <div className="text-slate-400 text-xs">
                English (United States) ▾
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

