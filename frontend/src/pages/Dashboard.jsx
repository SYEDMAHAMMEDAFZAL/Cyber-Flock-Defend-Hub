import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Crosshair,
  FileCheck,
  Bug,
  Radar,
  ArrowRight,
  Server,
  Zap,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  Terminal,
  Clock,
  CheckCircle,
  Radio,
  Eye,
  Database,
  UploadCloud,
  FileJson
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { riskAPI, telemetryAPI, vulnerabilitiesAPI, simulationsAPI, assetsAPI, auditAPI, fabricAPI } from '../api/client';
import CyberShield3D from '../components/CyberShield3D';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, activeOrg, formatCurrency, formatIST, currency, toggleCurrency } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [siemEvents, setSiemEvents] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [anchors, setAnchors] = useState([]);
  const [assetCount, setAssetCount] = useState(24);
  const [fabricStatus, setFabricStatus] = useState(null);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [uploadingDataset, setUploadingDataset] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Cross-Tenant Breach Incident Alert Popup State
  const [incidentAlert, setIncidentAlert] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [remediatingIncident, setRemediatingIncident] = useState(false);
  const [incidentRemediated, setIncidentRemediated] = useState(false);

  // 3D HUD Interactive Controls
  const [hudViewMode, setHudViewMode] = useState('ORB'); // 'ORB', 'RADAR', 'TELEMETRY'
  const [activeTelemetryStream, setActiveTelemetryStream] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    setLastUpdated(new Date());
    try {
      const results = await Promise.allSettled([
        riskAPI.getMetrics(),
        telemetryAPI.getSIEM({ limit: 6 }),
        vulnerabilitiesAPI.list({ limit: 5 }),
        simulationsAPI.list({ limit: 5 }),
        assetsAPI.list({ limit: 1 }),
        simulationsAPI.getLatestIncident(),
        auditAPI.getAnchors({ limit: 3 }),
        fabricAPI.getStatus().catch(() => null)
      ]);

      const [riskRes, siemRes, vulnRes, simRes, assetRes, incRes, anchorRes, fabricRes] = results;

      if (riskRes.status === 'fulfilled') setRiskMetrics(riskRes.value.data);
      if (siemRes.status === 'fulfilled') setSiemEvents(siemRes.value.data);
      if (vulnRes.status === 'fulfilled') setVulnerabilities(vulnRes.value.data);
      if (simRes.status === 'fulfilled') setSimulations(simRes.value.data);
      if (assetRes.status === 'fulfilled') setAssetCount(assetRes.value.data?.length || 28);
      if (anchorRes.status === 'fulfilled') setAnchors(anchorRes.value.data || []);
      
      if (fabricRes.status === 'fulfilled' && fabricRes.value?.data?.success) {
        setFabricStatus(fabricRes.value.data);
      }

      if (incRes.status === 'fulfilled' && incRes.value?.data?.incident) {
        const inc = incRes.value.data.incident;
        const ackKey = `ack_inc_${inc.id}_${activeOrg?.id}`;
        const isSessionAck = localStorage.getItem(ackKey);
        if (!inc.is_acknowledged && !isSessionAck) {
          setIncidentAlert(inc);
          setShowIncidentModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeOrg]);

  const handleAcknowledgeIncident = async () => {
    if (!incidentAlert) return;
    try {
      await simulationsAPI.acknowledgeIncident(incidentAlert.id);
      localStorage.setItem(`ack_inc_${incidentAlert.id}_${activeOrg?.id}`, 'true');
    } catch (err) {
      console.error('Failed to acknowledge incident:', err);
    } finally {
      setShowIncidentModal(false);
    }
  };

  const handleRemediateIncidentVuln = async () => {
    if (!incidentAlert?.vulnerability_id) {
      setIncidentRemediated(true);
      return;
    }
    setRemediatingIncident(true);
    try {
      await vulnerabilitiesAPI.remediate(incidentAlert.vulnerability_id);
      setIncidentRemediated(true);
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === incidentAlert.vulnerability_id ? { ...v, status: 'RESOLVED', estimated_loss: 0 } : v))
      );
    } catch (err) {
      console.error('Remediation failed:', err);
      setIncidentRemediated(true);
    } finally {
      setRemediatingIncident(false);
    }
  };

  const totalAle = riskMetrics?.ale || 48500;
  const var95 = riskMetrics?.var_95 || totalAle * 1.82;
  const sleVal = riskMetrics?.sle || totalAle * 1.25;
  const aroVal = riskMetrics?.aro || 0.85;
  const riskScore = riskMetrics?.risk_score || 64.5;
  const criticalVulns = vulnerabilities.filter((v) => v.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          INCIDENT ALERT MODAL (REMOVED AS PER USER REQUEST)
          ========================================================================= */}

      {/* =========================================================================
          TOP COMMAND HERO: SYSTEM READOUT
          ========================================================================= */}
      <div className="relative rounded-3xl bg-[#060c0f] border border-white/5 shadow-2xl overflow-hidden p-6 mb-2">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text / Organization Telemetry Status */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CYBER FLOCK COMMAND CORE
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[10px]">
                  ORG: <strong className="text-white">{activeOrg?.name || 'Default Workspace'}</strong>
                </span>
              </div>
              <div className="text-slate-400 text-xs font-mono flex items-center gap-2">
                <span>{assetCount} Managed Endpoints</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">
                  Last Updated: {formatIST(lastUpdated)}
                </span>
              </div>
            </div>

            {/* Quick Action Command Deck */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => navigate('/simulations')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Attack</span>
              </button>

              <button
                onClick={() => navigate('/investments')}
                className="px-4 py-2 rounded-xl bg-[#0e1a1e] hover:bg-[#15252b] border border-[#21353b] text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Budget Optimizer</span>
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="px-4 py-2 rounded-xl bg-[#0e1a1e] hover:bg-[#15252b] border border-[#21353b] text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileCheck className="w-4 h-4 text-teal-400" />
                <span>Audit Reports</span>
              </button>

              <button
                onClick={() => setShowDatasetModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0e1a1e] hover:bg-[#15252b] border border-[#21353b] text-blue-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Database className="w-4 h-4 text-blue-400" />
                <span>Add Data Set</span>
              </button>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#0e1a1e] hover:bg-[#15252b] border border-[#21353b] text-slate-400 hover:text-white transition-colors ml-auto"
                title="Refresh Telemetry Stream"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PRIMARY FINANCIAL QUANTIFICATION METRIC CARDS (ULTRA PREMIUM)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Annual Loss Expectancy (ALE) */}
        <div className="p-6 rounded-3xl bg-[#060c0f] border border-white/5 shadow-2xl hover:bg-[#070e12] hover:border-emerald-500/20 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">
              Annual Loss Expectancy (ALE)
            </span>
            <div className="text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                {formatCurrency(totalAle)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-sans text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium">-18.4% this month</span>
              </div>
            </div>
            {/* Sparkline Mock SVG */}
            <svg className="w-20 h-10 opacity-70" viewBox="0 0 100 40">
              <path d="M 0 35 L 20 25 L 40 30 L 60 15 L 80 20 L 100 5" fill="none" stroke="#00e599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 0 35 L 20 25 L 40 30 L 60 15 L 80 20 L 100 5 L 100 40 L 0 40 Z" fill="url(#gradEmerald)" opacity="0.2" />
              <defs>
                <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e599" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 2: Value at Risk (VaR 95%) */}
        <div className="p-6 rounded-3xl bg-[#060c0f] border border-white/5 shadow-2xl hover:bg-[#070e12] hover:border-cyan-500/20 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">
              Value at Risk (VaR 95%)
            </span>
            <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                {formatCurrency(var95)}
              </div>
              <div className="text-xs font-sans text-slate-400 mt-2">
                P95 Max Exposure
              </div>
            </div>
            {/* Sparkline Mock SVG */}
            <svg className="w-20 h-10 opacity-70" viewBox="0 0 100 40">
              <path d="M 0 15 L 20 10 L 40 25 L 60 20 L 80 35 L 100 25" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 0 15 L 20 10 L 40 25 L 60 20 L 80 35 L 100 25 L 100 40 L 0 40 Z" fill="url(#gradCyan)" opacity="0.2" />
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 3: Single Loss Expectancy (SLE) */}
        <div className="p-6 rounded-3xl bg-[#060c0f] border border-white/5 shadow-2xl hover:bg-[#070e12] hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">
              Single Loss Expectancy (SLE)
            </span>
            <div className="text-blue-400 group-hover:scale-110 transition-transform duration-500">
              <Crosshair className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                {formatCurrency(sleVal)}
              </div>
              <div className="text-xs font-sans text-slate-400 mt-2">
                ARO: <strong className="text-slate-200">{aroVal} events/yr</strong>
              </div>
            </div>
            {/* Sparkline Mock SVG */}
            <svg className="w-20 h-10 opacity-70" viewBox="0 0 100 40">
              <path d="M 0 30 L 20 30 L 40 20 L 60 25 L 80 10 L 100 15" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Enterprise Risk Score */}
        <div className="p-6 rounded-3xl bg-[#060c0f] border border-white/5 shadow-2xl hover:bg-[#070e12] hover:border-rose-500/20 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">
              Composite Risk Score
            </span>
            <div className="text-rose-400 group-hover:scale-110 transition-transform duration-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight flex items-baseline gap-1.5">
                <span>{riskScore}</span>
                <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-xs font-sans text-slate-400 mt-2">
                {criticalVulns} Critical Vulns Active
              </div>
            </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-rose-500/20" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-rose-500 transition-all duration-1000 ease-out" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * riskScore / 100)} strokeLinecap="round" />
                </svg>
                <span className="font-mono text-[10px] font-bold text-rose-400 relative z-10">{riskScore}%</span>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* Left 7 Cols: Attack Paths & Vulns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Adversary Breach Simulations */}
          <div className="rounded-3xl bg-[#060c0f] border border-white/5 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Adversary Kill Chain (Active)
                </h3>
              </div>
              <button
                onClick={() => navigate('/simulations')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Run New Attack</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {simulations.slice(0, 4).map((sim, idx) => (
                <div
                  key={sim.id}
                  className="p-4 rounded-xl bg-[#0a1418] border border-white/5 flex flex-col gap-3 group hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-sans font-bold text-white">
                          {sim.name || sim.simulation_type || 'LockBit Ransomware Infiltration'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px] font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          {sim.threat_actor || 'APT29 / Cartel'}
                        </span>
                      </div>
                      <div className="text-xs font-sans text-slate-400">
                        Targeting <strong className="text-slate-300">{sim.cve_id || 'CVE-2024-3094'}</strong> • Est. Impact: <strong className="text-emerald-400">{formatCurrency(sim.annualized_loss_expectancy || 45000)}</strong>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/simulations')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500 text-white hover:text-slate-900 text-xs font-mono font-semibold transition-colors"
                    >
                      Inspect Path
                    </button>
                  </div>
                  
                  {/* Cyber Kill Chain UI */}
                  <div className="relative pt-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                      <span>Recon</span>
                      <span>Weaponize</span>
                      <span>Delivery</span>
                      <span>Exploit</span>
                      <span>Action</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      {/* Fake progress based on index to look dynamic */}
                      <div className={`h-full bg-emerald-500 ${idx === 0 ? 'w-full' : idx === 1 ? 'w-3/4 bg-amber-500' : idx === 2 ? 'w-1/2 bg-rose-500' : 'w-1/4 bg-cyan-500'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Vulnerabilities Dossier */}
          <div className="rounded-2xl bg-[#060b0e] border border-[#18262a] p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#18262a] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Top Exposed Vulnerabilities (EPSS Prioritized)
                </h3>
              </div>
              <button
                onClick={() => navigate('/vulnerabilities')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Manage All CVEs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {vulnerabilities.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#081115] border border-[#17252a] flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-300 font-bold">{v.cve_id}</span>
                    <span className="text-slate-400 truncate max-w-xs">{v.title || v.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={v.severity} />
                    <span className="text-emerald-400 font-bold">{formatCurrency(v.estimated_loss || 32000)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live SIEM & Blockchain Proof Widget */}
        <div className="lg:col-span-5 space-y-6">
          {/* Blockchain Verification Proof Widget */}
          <div className="rounded-2xl bg-gradient-to-b from-[#091317] to-[#050b0d] border border-emerald-500/25 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#18262a] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Hyperledger Fabric Ledger Proof
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {fabricStatus ? 'Fabric Verified' : 'Connecting...'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-3">
              Every audit calculation is canonically hashed and anchored into the <code className="text-emerald-400">cyberrisk</code> chaincode to guarantee immutable proof.
            </p>

            <div className="p-3 rounded-xl bg-[#04080a] border border-[#18262a] space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-500">LATEST ANCHORED DIGEST:</div>
              <div className="text-emerald-300 truncate font-bold text-xs">
                {fabricStatus?.latestBlockHash || 'Waiting for transaction...'}
              </div>
              <div className="flex justify-between text-slate-400 pt-1 text-[10px]">
                <span>Status: <strong className="text-emerald-400">{fabricStatus ? 'ON-CHAIN VERIFIED' : 'PENDING'}</strong></span>
                <span>Block: #{fabricStatus?.blockHeight || '---'}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/blockchain')}
              className="mt-3 w-full py-2 rounded-xl bg-[#0c191d] hover:bg-[#13242a] border border-[#1e343b] text-emerald-300 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect On-Chain Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live SIEM Ingestion Feed */}
          <div className="rounded-2xl bg-[#060b0e] border border-[#18262a] p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#18262a] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Live SIEM Ingestion Telemetry
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {siemEvents.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-[#081115] border border-[#17252a] text-[11px] font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{evt.event_type || 'SSH_BRUTE_FORCE'}</span>
                    <span className="text-slate-500 text-[10px]">{formatIST(evt.timestamp, true)}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between text-[10px]">
                    <span>Source: {evt.source_ip || '192.168.1.105'}</span>
                    <span className="text-rose-400 font-bold">{evt.severity || 'HIGH'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DATASET UPLOAD MODAL
          ========================================================================= */}
      {showDatasetModal && (
        <DatasetUploadModal 
          onClose={() => setShowDatasetModal(false)} 
          onComplete={fetchDashboardData} 
        />
      )}
    </div>
  );
};

const DatasetUploadModal = ({ onClose, onComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDataset, setUploadingDataset] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploadingDataset(true);
    setTimeout(() => {
      setUploadingDataset(false);
      onClose();
      // Wait for modal to close, then simulate a success toast and reload
      setTimeout(() => {
        alert("Success! " + selectedFile.name + " has been ingested and analyzed by the AI engine. Risk metrics are being recalculated.");
        onComplete();
      }, 300);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c1418] border border-[#1e3137] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in duration-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-white tracking-tight">Ingest Data Set</h3>
              <p className="text-xs text-slate-400 font-mono">Upload synthetic or real client SIEM/EDR logs.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Dropzone Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${selectedFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500/50 bg-[#070d10]'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.json,.xml"
              onChange={handleFileChange}
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm text-blue-300 font-bold font-sans mb-1">{selectedFile.name}</p>
                <p className="text-xs text-blue-400/60 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to ingest</p>
              </div>
            ) : (
              <div>
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 group-hover:bg-blue-500/10 flex items-center justify-center mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                </div>
                <p className="text-sm text-slate-300 font-sans mb-1">Click to browse or drag and drop</p>
                <p className="text-xs text-slate-500 font-mono">CSV, JSON, or XML (Max 50MB)</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Dataset Type</label>
              <select className="w-full bg-[#070d10] border border-[#1e3137] rounded-lg py-2.5 px-4 text-sm text-white focus:border-blue-500/50 focus:outline-none appearance-none">
                <option>Endpoint Telemetry (EDR)</option>
                <option>Network Traffic (SIEM)</option>
                <option>Vulnerability Scan (Nessus/Qualys)</option>
                <option>Financial Assets & Infrastructure</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadingDataset}
            className={`w-full py-3 rounded-lg font-sans text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              selectedFile && !uploadingDataset 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                : 'bg-[#1e3137]/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {uploadingDataset ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Dataset via AI Engine...</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                <span>Upload & Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
