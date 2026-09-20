import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Building2,
  Server,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Target
} from 'lucide-react';
import { onboardingAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { activeOrg } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [orgName, setOrgName] = useState(activeOrg?.name || 'Aegis Quantum Systems');
  const [industry, setIndustry] = useState('BFSI');
  const [employeeCount, setEmployeeCount] = useState('1000-5000');
  const [cloudProvider, setCloudProvider] = useState('HYBRID (AWS + AZURE)');
  const [endpointCount, setEndpointCount] = useState('2500');
  const [planTier, setPlanTier] = useState('ENTERPRISE');
  
  // New Budget Fields
  const [annualBudget, setAnnualBudget] = useState('5000000');
  const [targetRiskReduction, setTargetRiskReduction] = useState('80');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onboardingAPI.submit({
        org_name: orgName,
        industry: industry,
        employee_count: employeeCount,
        cloud_footprint: cloudProvider,
        monitored_endpoints: parseInt(endpointCount) || 1000,
        selected_plan: planTier,
        annual_budget: parseFloat(annualBudget),
        target_risk_reduction: parseFloat(targetRiskReduction),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#18262a] pb-4">
        <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-mono font-semibold">
          <Sliders className="w-4 h-4" />
          <span>ENTERPRISE TENANT ONBOARDING</span>
        </div>
        <h1 className="text-2xl font-mono font-bold text-white tracking-tight">
          Enterprise Security Profile Setup
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure asset inventory baselines, regulatory compliance boundaries, and quantification parameters.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-400">
        <span className={step >= 1 ? 'text-emerald-400 font-bold' : ''}>1. Organization Profile</span>
        <span>•</span>
        <span className={step >= 2 ? 'text-emerald-400 font-bold' : ''}>2. Digital Infrastructure</span>
        <span>•</span>
        <span className={step >= 3 ? 'text-emerald-400 font-bold' : ''}>3. Subscription & Baseline</span>
      </div>

      {/* Wizard Form */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 min-h-[380px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Organization & Regulatory Profile
            </h3>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Organization Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="BFSI">BFSI (Banking & Financial Services)</option>
                <option value="HEALTHCARE">Healthcare & Life Sciences</option>
                <option value="TECHNOLOGY">Technology & Cloud SaaS</option>
                <option value="MANUFACTURING">Manufacturing & Critical Infrastructure</option>
                <option value="RETAIL">Retail & E-Commerce</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Employee Headcount Range</label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="100-500">100 - 500 Employees</option>
                <option value="500-1000">500 - 1,000 Employees</option>
                <option value="1000-5000">1,000 - 5,000 Employees</option>
                <option value="5000+">5,000+ Enterprise Scale</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Digital Asset & Footprint Landscape
            </h3>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Cloud Infrastructure</label>
              <select
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="HYBRID (AWS + AZURE)">Hybrid Multi-Cloud (AWS + Azure)</option>
                <option value="AWS">Amazon Web Services (AWS)</option>
                <option value="AZURE">Microsoft Azure</option>
                <option value="GCP">Google Cloud Platform (GCP)</option>
                <option value="ON_PREM">On-Premises Bare Metal Datacenter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Monitored Endpoints & Workloads</label>
              <input
                type="number"
                value={endpointCount}
                onChange={(e) => setEndpointCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-emerald-400" />
                Financial Baselines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Annual Cybersecurity Budget (INR)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={annualBudget}
                      onChange={(e) => setAnnualBudget(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Target Risk Reduction (%)</label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      max="100"
                      value={targetRiskReduction}
                      onChange={(e) => setTargetRiskReduction(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Subscription Tier
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'ESSENTIAL', price: '₹15,000/mo', features: 'Basic FAIR calculations, 5 simulations/mo' },
                  { name: 'PROFESSIONAL', price: '₹45,000/mo', features: 'Monte Carlo 10k, PuLP optimizer, SIEM feeds' },
                  { name: 'ENTERPRISE', price: '₹85,000/mo', features: 'Unlimited simulations, EVM anchors, custom ML' },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    onClick={() => setPlanTier(tier.name)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      planTier === tier.name
                        ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-[#091215] border-[#18262a] hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-white block">{tier.name}</span>
                    <span className="text-sm font-mono text-emerald-300 font-bold block my-1">{tier.price}</span>
                    <p className="text-[11px] text-slate-400 font-sans">{tier.features}</p>
                  </div>
                ))}
              </div>
            </div>

            {success && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Onboarding verified and deployed! Redirecting to Executive Dashboard...</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#18262a]">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-slate-400 hover:text-white text-xs font-mono disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Finalizing Setup...' : 'Complete Onboarding'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;


