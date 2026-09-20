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
              <label className="block text-[11px] font-medium text-slate-500 tracking-wider mb-2 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 tracking-wider mb-2 uppercase">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-900 font-semibold rounded-lg py-2.5 text-sm hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950 mt-4 disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

