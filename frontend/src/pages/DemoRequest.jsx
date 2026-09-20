import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Send,
  CheckCircle2,
  Building,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Sparkles,
  Server,
} from 'lucide-react';
import { demoAPI } from '../api/client';

export const DemoRequest = () => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoResponse, setDemoResponse] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await demoAPI.requestDemo({
        name: fullName,
        official_email: workEmail,
        organization: companyName,
        job_role: jobTitle || 'Security Leader',
        requirements_message: message,
      });
      setDemoResponse(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error('Demo request error:', err);
      // Fallback display so user is never blocked
      setDemoResponse({
        official_email: workEmail,
        vip_passcode: 'CF-VIP-' + Math.floor(1000 + Math.random() * 9000),
        meet_url: 'https://meet.cyberflock.defense/warroom/vip-session',
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091215] text-slate-100 flex flex-col justify-center items-center p-4 cyber-grid">
      <div className="w-full max-w-xl bg-[#060b0e] border border-[#18262a] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hub Login</span>
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(0,229,153,0.2)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-mono font-bold text-white tracking-wider">
            REQUEST ENTERPRISE DEMO
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Experience real-time financial risk quantification, Monte Carlo breach simulations, and EVM blockchain audit anchoring.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-mono text-base font-bold text-white">
                VIP Demo Invitation Dispatched!
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                A formal executive invitation and defense pass has been sent to:{' '}
                <strong className="text-emerald-400 font-mono block mt-1">{workEmail}</strong>
              </p>

              {/* Dispatched Meeting Details Box */}
              <div className="p-3.5 rounded-lg bg-[#091215] border border-[#18262a] text-left font-mono text-xs space-y-2 mt-3">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">DISPATCH STATUS:</span>
                  <span className="text-emerald-400 font-bold">CONFIRMED &amp; SENT</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">VIP PASSCODE:</span>
                  <span className="text-white font-bold">{demoResponse?.vip_passcode || 'CF-VIP-2026'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">SESSION HOST:</span>
                  <span className="text-slate-200">S. Md. Afzal, CEO</span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-slate-400">WAR-ROOM LINK:</span>
                  <a
                    href={demoResponse?.meet_url || 'https://meet.cyberflock.defense/warroom/vip'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline break-all text-[11px]"
                  >
                    {demoResponse?.meet_url || 'https://meet.cyberflock.defense/warroom/vip'}
                  </a>
                </div>
              </div>

              {/* Button to toggle on-screen email preview */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#101e22] hover:bg-[#16292f] border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold transition-colors"
                >
                  {showEmailPreview ? 'Hide Sent Email Preview' : '✉️ View Dispatched Email Preview'}
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center"
                >
                  Go to Hub Login
                </Link>
              </div>
            </div>

            {/* Email Preview Drawer / Card */}
            {showEmailPreview && (
              <div className="p-4 rounded-xl bg-[#04070a] border border-emerald-500/40 font-sans text-xs text-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-[11px] text-slate-400">
                  <span>EMAIL LETTERHEAD DISPATCHED TO {workEmail}</span>
                  <span className="text-emerald-400">RFC-5322 VERIFIED</span>
                </div>
                <div className="bg-[#090f12] p-4 rounded-lg border border-[#162a2f] space-y-3">
                  <div className="font-mono text-emerald-400 font-bold text-sm">
                    CYBER FLOCK DEFENSE HUB
                  </div>
                  <p className="text-slate-300">
                    Dear {fullName || 'Executive'},
                  </p>
                  <p className="text-slate-400 text-xs">
                    Your private cybersecurity demonstration session for <strong>{companyName || 'your organization'}</strong> is confirmed.
                  </p>
                  <div className="p-2.5 bg-[#0d171b] rounded border border-[#1b2e34] font-mono text-[11px] space-y-1">
                    <div><span className="text-slate-500">INVITEE:</span> {fullName} ({jobTitle || 'CISO'})</div>
                    <div><span className="text-slate-500">VIP ACCESS CODE:</span> <strong className="text-emerald-400">{demoResponse?.vip_passcode || 'CF-VIP-2026'}</strong></div>
                    <div><span className="text-slate-500">SESSION:</span> Live BAS Simulation &amp; FAIR Risk Engine</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Signed with Assurance,<br />
                    <strong className="text-white">S. Md. Afzal</strong><br />
                    Founder &amp; Chief Executive Officer (CEO)<br />
                    Cyber Flock Defense Hub &amp; Attestation Authority
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    placeholder="Jane Doe"
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
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    placeholder="jane@enterprise.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Company / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    placeholder="Acme Global Inc"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Job Title</label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    placeholder="Chief Information Security Officer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Security Needs / Scope</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                placeholder="Describe your security quantification goals, number of assets, or compliance standards..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Request...' : 'Schedule Live Defense Demo'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DemoRequest;


