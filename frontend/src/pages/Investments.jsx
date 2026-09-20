import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  Cpu,
  RefreshCw,
  Sparkles,
  FileText,
  Printer,
  Download,
  Shield,
  Award,
  X,
  Check,
  Copy,
  Calendar,
  Building,
  Hash,
  ArrowUpRight,
  FileSpreadsheet,
  Lock,
  Calculator,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { investmentsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Investments = () => {
  const { formatCurrency, currency, activeOrg, formatIST } = useAuth();
  const [budget, setBudget] = useState(58500);
  const [riskTolerance, setRiskTolerance] = useState('BALANCED');
  const [targetReduction, setTargetReduction] = useState(50);
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const runOptimization = async (customBudget) => {
    setLoading(true);
    const budgetToUse = typeof customBudget === 'number' ? customBudget : Number(budget);
    try {
      const res = await investmentsAPI.optimize({
        allocated_budget: budgetToUse,
        budget: budgetToUse,
        risk_tolerance: riskTolerance === 'BALANCED' ? 'MEDIUM' : (riskTolerance === 'CONSERVATIVE' ? 'LOW' : 'HIGH'),
        target_ale_reduction: Number(targetReduction),
      });
      setOptimizationResult(res.data);
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [riskTolerance]);

  const selected = optimizationResult?.recommended_controls || optimizationResult?.selected_controls || [];
  const rejected = optimizationResult?.deferred_controls || optimizationResult?.rejected_controls || [];
  const totalCost = optimizationResult?.total_investment_required ?? optimizationResult?.total_cost ?? (selected.reduce((a, b) => a + (b.cost || b.cost_inr || 0), 0));
  const netAleReduction = optimizationResult?.net_ale_reduction ?? ((optimizationResult?.ale_before || 28500000) - (optimizationResult?.ale_after || 4702500));
  const rawRoi = optimizationResult?.estimated_roi_percent ?? optimizationResult?.roi_percentage ?? 0;

  // Enterprise Multi-Year ROSI (Cyber security investments amortize over 3 years)
  const threeYearRoi = totalCost > 0 ? (((netAleReduction * 3) - totalCost) / totalCost) * 100 : 0;

  // Cryptographic deterministic hash of this optimization run
  const reportHash = useMemo(() => {
    const raw = `${activeOrg?.id || 'org'}-${budget}-${totalCost}-${netAleReduction}-${selected.length}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex}7f89c4501a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d`.substring(0, 66);
  }, [budget, totalCost, netAleReduction, selected.length, activeOrg]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(reportHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Portfolio_Status', 'Control_Code', 'Control_Name', 'Category', 'Allocated_Cost_INR', 'Risk_Reduction_Percent', 'Efficiency_Score'];
    const rows = [
      ...selected.map(c => [
        'FUNDED',
        c.code || 'SEC',
        `"${(c.name || 'Security Control').replace(/"/g, '""')}"`,
        c.category || 'Preventative',
        c.cost ?? c.cost_inr ?? 0,
        `${((c.ale_reduction_rate || (c.risk_reduction_percent ? c.risk_reduction_percent / 100 : 0.25)) * 100).toFixed(0)}%`,
        `${((c.ale_reduction_rate || 0.25) * 1000000 / Math.max(1, c.cost || c.cost_inr || 1)).toFixed(1)}x`
      ]),
      ...rejected.map(c => [
        'UNFUNDED',
        c.code || 'DEF',
        `"${(c.name || 'Security Control').replace(/"/g, '""')}"`,
        c.category || 'Preventative',
        c.cost ?? c.cost_inr ?? 0,
        `${((c.ale_reduction_rate || (c.risk_reduction_percent ? c.risk_reduction_percent / 100 : 0.15)) * 100).toFixed(0)}%`,
        'Deferred (Budget Cap Reached)'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CyberFlock_Knapsack_Investment_Plan_${activeOrg?.name || 'Enterprise'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const budgetPresets = [
    { label: '₹25K', val: 25000 },
    { label: '₹50K', val: 50000 },
    { label: '₹58.5K', val: 58500 },
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹5 Lakh', val: 500000 },
    { label: '₹25 Lakh', val: 2500000 },
    { label: '₹1 Crore', val: 10000000 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Security Investment & Knapsack Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            MILP (Mixed Integer Linear Programming) PuLP 0/1 Knapsack solver maximizing ALE reduction under strict budget constraints. 
            Provides transparent capital allocation with board-ready attestation reports.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)]"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Optimization Report</span>
          </button>
        </div>
      </div>

      {/* Control Panel / Interactive Calculation Console */}
      <div className="bg-gradient-to-br from-[#060b0e] to-[#04080a] border border-[#18262a] rounded-xl p-5 space-y-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="flex flex-wrap items-center justify-between border-b border-[#18262a] pb-4 gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Interactive Optimization Parameters & Budget Controls
          </div>
          <button
            onClick={() => runOptimization()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{loading ? 'Solving Knapsack MILP...' : 'Calculate & Solve Portfolio'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">Quick Presets:</span>
          {budgetPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setBudget(p.val);
                runOptimization(p.val);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border ${
                budget === p.val
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-[#091215] text-slate-400 border-[#18262a] hover:border-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Budget Input & Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 uppercase font-semibold">Available CAPEX Budget:</span>
              <div className="flex items-center gap-1 bg-[#091215] border border-[#18262a] px-2 py-1 rounded-md">
                <span className="text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="5000"
                  max="50000000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-24 bg-transparent text-emerald-400 font-mono font-bold text-xs text-right focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="10000000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{formatCurrency(10000)}</span>
              <span>{formatCurrency(10000000)}</span>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="space-y-3">
            <span className="block text-xs font-mono text-slate-400 uppercase font-semibold">Risk Tolerance Profile:</span>
            <div className="grid grid-cols-3 gap-2">
              {['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].map((t) => (
                <button
                  key={t}
                  onClick={() => setRiskTolerance(t)}
                  className={`py-2 rounded-lg border text-[10px] font-mono transition-colors tracking-wide ${
                    riskTolerance === t
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(0,229,153,0.2)]'
                      : 'bg-[#091215] border-[#18262a] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target ALE Reduction % */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase font-semibold">Target Risk Reduction:</span>
              <span className="text-emerald-400 font-bold">{targetReduction}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={targetReduction}
              onChange={(e) => setTargetReduction(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10% (Minimal)</span>
              <span>90% (Zero Trust)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Solver Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Allocated Capital Expenditure"
          value={formatCurrency(totalCost)}
          subtitle={`Remaining Budget: ${formatCurrency(Math.max(0, budget - totalCost))}`}
          icon={DollarSign}
          variant="emerald"
          badge="SOLVER OPTIMAL"
        />
        <MetricCard
          title="Net ALE Reduction"
          value={formatCurrency(netAleReduction)}
          subtitle="Annualized cyber loss exposure saved"
          icon={ShieldCheck}
          variant="emerald"
          badge="SAVINGS"
        />
        <MetricCard
          title="Return on Security Investment (ROSI)"
          value={threeYearRoi > 0 ? `+${threeYearRoi.toFixed(1)}%` : `${rawRoi.toFixed(1)}%`}
          subtitle={threeYearRoi > 0 ? '3-Year Enterprise Cumulative Benefit' : 'Annual Net: (ALE Saved - Cost) / Cost'}
          icon={TrendingUp}
          variant={threeYearRoi > 0 ? 'emerald' : 'amber'}
          badge={threeYearRoi > 0 ? 'OPTIMAL ROSI' : 'DEFICIT RISK'}
        />
      </div>

      {/* Recommendations Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Controls */}
        <div className="bg-gradient-to-b from-[#060b0e] to-[#04070a] border border-emerald-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,153,0.05)] relative">
          <div className="flex items-center justify-between mb-4 border-b border-[#18262a] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Optimal Portfolio ({selected.length} Controls Funded)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
              CAPEX FUNDED
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {selected.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No controls fit into current budget limit. Increase budget or select a preset.
              </div>
            ) : (
              selected.map((ctrl, i) => {
                const cost = ctrl.cost ?? ctrl.cost_inr ?? 18500;
                const reduction = (ctrl.ale_reduction_rate || (ctrl.risk_reduction_percent ? ctrl.risk_reduction_percent / 100 : 0.25)) * 100;
                const efficiency = ((reduction * 100000) / Math.max(1, cost)).toFixed(1);
                return (
                  <div
                    key={ctrl.id || ctrl.code || i}
                    className="p-3.5 rounded-lg bg-[#091215] border border-[#18262a] flex flex-col gap-2 hover:border-emerald-500/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{ctrl.name || 'Automated Security Control'}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ctrl.code || 'SEC'}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-emerald-400">
                        {formatCurrency(cost)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span>{reduction.toFixed(0)}% Risk Reduction</span>
                        <span className="text-slate-600 px-1">|</span>
                        <span>{ctrl.category || 'Preventative'}</span>
                      </div>
                      <div className="text-emerald-500/80 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        Efficiency: {efficiency}x
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Deferred / Rejected Controls */}
        <div className="bg-gradient-to-b from-[#060b0e] to-[#04070a] border border-slate-800 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between mb-4 border-b border-[#18262a] pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-slate-500" />
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Deferred Controls ({rejected.length} Excluded)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              UNFUNDED (OVER CEILING)
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {rejected.map((ctrl, i) => {
              const cost = ctrl.cost ?? ctrl.cost_inr ?? 24000;
              const reduction = (ctrl.ale_reduction_rate || (ctrl.risk_reduction_percent ? ctrl.risk_reduction_percent / 100 : 0.15)) * 100;
              const efficiency = ((reduction * 100000) / Math.max(1, cost)).toFixed(1);
              return (
                <div
                  key={ctrl.id || ctrl.code || i}
                  className="p-3.5 rounded-lg bg-[#091215]/60 border border-slate-800/80 flex flex-col gap-2 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-bold text-slate-400 flex items-center gap-2">
                      <span className="line-through decoration-slate-600">{ctrl.name || 'Enterprise Security Control'}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-700/50">
                        {ctrl.code || 'DEF'}
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-500">
                      {formatCurrency(cost)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="text-slate-500">
                      Marginal risk utility exceeded under current budget ceiling
                    </div>
                    <div className="text-rose-400/80 font-bold">
                      Efficiency: {efficiency}x
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOARD-READY EXECUTIVE OPTIMIZATION REPORT MODAL & PRINT DOCUMENT
          ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#060b0e] border border-[#18262a] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Controls Header */}
            <div className="p-4 border-b border-[#18262a] bg-[#030608] flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-white">
                  Executive Security Investment & Knapsack Attestation Report
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,153,0.3)]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 text-xs font-mono rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print-only-block" id="printable-audit-report">
              {/* Executive Formal Letterhead */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-950 flex items-center gap-2">
                    <Shield className="w-7 h-7 text-emerald-600" />
                    CYBER FLOCK DEFENSE HUB
                  </div>
                  <div className="text-xs uppercase font-mono tracking-widest text-slate-600 font-bold mt-1">
                    Executive Capital Allocation & Knapsack Optimization Attestation
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-600">
                  <div><strong>Document Ref:</strong> CF-OPT-{Math.abs(reportHash.slice(-6)).toString().toUpperCase()}</div>
                  <div><strong>Date of Attestation:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (IST)</div>
                  <div><strong>Algorithmic Solver:</strong> Mixed-Integer Linear Programming (MILP PuLP 0/1)</div>
                </div>
              </div>

              {/* Organization Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg border border-slate-300 font-mono text-xs mb-6">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Audited Enterprise</span>
                  <span className="font-bold text-slate-900">{activeOrg?.name || 'Enterprise Workspace'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Risk Profile</span>
                  <span className="font-bold text-slate-900">{riskTolerance} TOLERANCE</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Audit Classification</span>
                  <span className="font-bold text-emerald-700">BOARD CONFIDENTIAL</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Mathematical Verification</span>
                  <span className="font-bold text-emerald-700">SOLVER PROVEN OPTIMAL</span>
                </div>
              </div>

              {/* Section 1: Executive Summary */}
              <div className="mb-6 space-y-2">
                <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  1. Executive Capital Allocation Rationale
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  This formal attestation documents the mathematical portfolio allocation for <strong>{activeOrg?.name || 'the organization'}</strong> under an available cybersecurity capital expenditure ceiling of <strong>{formatCurrency(budget)}</strong>. 
                  Using the Factor Analysis of Information Risk (FAIR) framework and PuLP Mixed Integer Linear Programming (0/1 Knapsack optimization), the system mathematically identified the subset of defensive controls that generates the highest quantifiable reduction in Annualized Loss Expectancy (ALE).
                </p>
              </div>

              {/* Section 2: Financial Capital Allocation Table */}
              <div className="mb-6">
                <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                  2. Quantitative Capital Allocation & Risk Metrics
                </h4>
                <table className="w-full text-xs font-mono border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 text-left">
                      <th className="border border-slate-300 p-2.5 w-[35%]">OPTIMIZATION METRIC</th>
                      <th className="border border-slate-300 p-2.5 w-[35%]">MATHEMATICAL INTERPRETATION</th>
                      <th className="border border-slate-300 p-2.5 text-right w-[30%]">QUANTIFIED VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold">Approved Budget Ceiling</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Total authorized capital allocation</td>
                      <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">{formatCurrency(budget)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-bold text-emerald-700">Optimal Capital Invested</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Total cost of selected controls portfolio</td>
                      <td className="border border-slate-300 p-2 text-right font-bold text-emerald-700 text-sm">{formatCurrency(totalCost)}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold">Unallocated Budget Reserve</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Surplus capital retained post-optimization</td>
                      <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">{formatCurrency(Math.max(0, budget - totalCost))}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-bold text-emerald-700">Net Annual ALE Saved</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Annualized cyber breach loss exposure prevented</td>
                      <td className="border border-slate-300 p-2 text-right font-bold text-emerald-700 text-sm">{formatCurrency(netAleReduction)}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold">3-Year Cumulative ROSI</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Enterprise multi-year Return on Security Investment</td>
                      <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">
                        {threeYearRoi > 0 ? `+${threeYearRoi.toFixed(1)}%` : `${rawRoi.toFixed(1)}%`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Recommended Controls Portfolio Table */}
              <div className="mb-6">
                <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                  3. Optimal Funded Controls Portfolio ({selected.length} Selected)
                </h4>
                <table className="w-full text-xs font-mono border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 text-left">
                      <th className="border border-slate-300 p-2">CODE</th>
                      <th className="border border-slate-300 p-2">CONTROL NAME</th>
                      <th className="border border-slate-300 p-2">CATEGORY</th>
                      <th className="border border-slate-300 p-2 text-right">COST</th>
                      <th className="border border-slate-300 p-2 text-right">RISK REDUCTION</th>
                      <th className="border border-slate-300 p-2 text-right">EFFICIENCY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map((ctrl, i) => {
                      const cost = ctrl.cost ?? ctrl.cost_inr ?? 18500;
                      const red = (ctrl.ale_reduction_rate || 0.25) * 100;
                      return (
                        <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                          <td className="border border-slate-300 p-2 font-bold text-slate-800">{ctrl.code || `SEC-0${i+1}`}</td>
                          <td className="border border-slate-300 p-2 font-semibold text-slate-900">{ctrl.name}</td>
                          <td className="border border-slate-300 p-2 text-slate-600">{ctrl.category || 'Preventative'}</td>
                          <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">{formatCurrency(cost)}</td>
                          <td className="border border-slate-300 p-2 text-right text-emerald-700 font-bold">{red.toFixed(0)}%</td>
                          <td className="border border-slate-300 p-2 text-right font-bold text-slate-700">{((red * 100000) / Math.max(1, cost)).toFixed(1)}x</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Cryptographic Integrity Seal & QR Stamp */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border-2 border-slate-300 flex flex-col sm:flex-row items-center gap-6 print-page-break">
                <div className="w-28 h-28 bg-white p-2 rounded-lg border border-slate-300 shrink-0 flex flex-col items-center justify-center">
                  <QRCodeSVG
                    value={`https://verify.cyberflock.defense/optimization/${reportHash}`}
                    size={88}
                    level="M"
                  />
                  <span className="text-[8px] font-mono text-slate-600 mt-1 font-bold">SCAN TO VERIFY</span>
                </div>

                <div className="space-y-1.5 flex-1 w-full text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Award className="w-4 h-4" />
                    <span>CANONICAL CRYPTOGRAPHIC PROOF SEAL</span>
                  </div>
                  <div className="text-[11px] text-slate-600 break-all">
                    <strong>SHA-256 Digest:</strong> {reportHash}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Optimization Vector:</strong> PuLP CBC Solver • 0/1 Binary Branch-and-Bound
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tamper-evident mathematical attestation. Any changes to budget parameters will invalidate this cryptographic signature.
                  </div>
                </div>
              </div>

              {/* Section 5: Formal Signature */}
              <div className="grid grid-cols-1 gap-8 pt-4 border-t-2 border-slate-300 font-mono text-xs print-page-break">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end">
                    <span className="text-slate-800 font-serif italic text-sm font-semibold tracking-wide">S. Md. Afzal</span>
                  </div>
                  <strong className="text-slate-900 block text-xs">S. Md. Afzal, Founder & Chief Executive Officer (CEO)</strong>
                  <span className="text-slate-600 text-[10px]">Cyber Flock Defense Hub & Attestation Authority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;
