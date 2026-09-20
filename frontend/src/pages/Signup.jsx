import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('analyst');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authAPI.register({
        email,
        password,
        full_name: fullName,
        role,
        organization_name: orgName,
      });
      setSuccess('Enterprise tenant & user successfully registered in database! Opening console...');
      setTimeout(async () => {
        try {
          await login(email, password);
          navigate('/dashboard');
        } catch {
          navigate('/login');
        }
      }, 900);
    } catch (err) {
      console.error('Registration failed:', err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : Array.isArray(detail) 
          ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
          : 'Registration failed. Please review inputs.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091215] text-slate-100 flex flex-col justify-center items-center p-4 cyber-grid">
      <div className="w-full max-w-md bg-[#060b0e] border border-[#18262a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-purple-500" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-mono font-bold text-white tracking-wider">
            REGISTER NEW TENANT
          </h1>
          <p className="text-xs font-mono text-emerald-400 mt-0.5">
            Provision Enterprise Cyber Defense Workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                placeholder="Dr. Jordan Hayes"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Organization Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                placeholder="Sentinel Capital"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                placeholder="jordan@sentinel.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Primary Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="analyst">Security Analyst</option>
              <option value="auditor">Risk & Compliance Auditor</option>
              <option value="executive">CISO / Executive</option>
              <option value="admin">Security Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Provisioning...' : 'Complete Workspace Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#18262a] text-center text-[11px] font-mono text-slate-500">
          Already have an enterprise account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;


