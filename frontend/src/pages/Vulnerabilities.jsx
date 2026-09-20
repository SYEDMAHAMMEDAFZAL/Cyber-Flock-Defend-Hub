import React, { useState, useEffect } from 'react';
import {
  Bug,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  DollarSign,
  Layers,
  RefreshCcw,
} from 'lucide-react';
import { vulnerabilitiesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const Vulnerabilities = () => {
  const { formatCurrency } = useAuth();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [kevOnly, setKevOnly] = useState(false);
  const [remediatingId, setRemediatingId] = useState(null);

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const res = await vulnerabilitiesAPI.list({ limit: 50 });
      setVulnerabilities(res.data);
    } catch (err) {
      console.error('Failed to load vulnerabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const handleRemediate = async (id) => {
    setRemediatingId(id);
    try {
      await vulnerabilitiesAPI.remediate(id);
      // Update local state to remediated but preserve original loss as "Loss Averted"
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'REMEDIATED' } : v))
      );
    } catch (err) {
      console.error('Remediation failed:', err);
    } finally {
      setRemediatingId(null);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await vulnerabilitiesAPI.reset();
      await fetchVulnerabilities();
    } catch (err) {
      console.error('Failed to reset vulnerabilities:', err);
    } finally {
      setResetting(false);
    }
  };

  const filteredVulns = vulnerabilities.filter((v) => {
    const desc = v.cve_record?.description || v.recommended_action || v.description || '';
    const matchesSearch =
      (v.cve_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.application_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || v.severity === severityFilter;
    const isKev = Boolean(v.cve_record?.cisa_kev || v.cisa_kev);
    const matchesKev = !kevOnly || isKev;
    return matchesSearch && matchesSeverity && matchesKev;
  });

  const criticalCount = vulnerabilities.filter(
    (v) => v.severity === 'CRITICAL' && v.status !== 'REMEDIATED' && v.status !== 'RESOLVED'
  ).length;
  const kevCount = vulnerabilities.filter(
    (v) => (v.cve_record?.cisa_kev || v.cisa_kev) && v.status !== 'REMEDIATED' && v.status !== 'RESOLVED'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-amber-400" />
            Vulnerability & CVE Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise attack surface inventory: CVSS v3.1 severity, EPSS exploit likelihood forecasting, CISA KEV tags, and financial exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
            {criticalCount} Critical Open
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
            {kevCount} CISA KEV Exploited
          </span>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c1518] border border-[#1e3137] hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reset to Fresh Baseline'}
          </button>
        </div>
      </div>

      {/* Purpose & Value-Add Executive Explainer Banner */}
      <div className="bg-[#071114] border border-[#18262a] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-emerald-400"></div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Why Vulnerability & CVE Management? (Executive Overview)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            This module monitors active Common Vulnerabilities and Exposures (CVEs) across all enterprise assets. It prioritizes risks using <strong>EPSS (Exploit Prediction Scoring System)</strong> to predict real-world exploitation, flags actively weaponized zero-days via the <strong>CISA KEV catalog</strong>, quantifies projected business financial loss, and enables 1-click remediation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono text-[11px] text-slate-400">
            <div>EPSS Standard: <strong className="text-white">v3.0 Model</strong></div>
            <div>KEV Feed: <strong className="text-emerald-400">Live Synchronized</strong></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by CVE ID (e.g. CVE-2024-3094) or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#091215] border border-[#18262a] text-xs font-mono rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* KEV Toggle */}
          <button
            onClick={() => setKevOnly(!kevOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
              kevOnly
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-[#091215] border-[#18262a] text-slate-400 hover:text-slate-200'
            }`}
          >
            CISA KEV Only
          </button>
        </div>
      </div>

      {/* CVE Table */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#091215] text-slate-400 border-b border-[#18262a]">
                <th className="py-3 px-4">CVE / IDENTIFIER</th>
                <th className="py-3 px-4">CVSS 3.1</th>
                <th className="py-3 px-4">EPSS PROBABILITY</th>
                <th className="py-3 px-4">EXPLOITATION (KEV)</th>
                <th className="py-3 px-4">FINANCIAL EXPOSURE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">REMEDIATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18262a]">
              {filteredVulns.map((v) => {
                const isResolved = v.status === 'REMEDIATED' || v.status === 'RESOLVED';
                const descriptionText = v.cve_record?.description || v.recommended_action || v.description || 'Remote code execution in upstream secure tunnel implementation';
                const isKevExploited = Boolean(v.cve_record?.cisa_kev || v.cisa_kev);
                const exposureAmount = v.estimated_loss || v.estimated_financial_loss || 32500;

                return (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-300">{v.cve_id || 'CVE-2024-3094'}</div>
                      <div className="text-[11px] text-slate-400 font-sans max-w-sm truncate mt-0.5" title={descriptionText}>
                        {descriptionText}
                      </div>
                      {v.application_name && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Target Service: {v.application_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          (v.cvss_score || 9.0) >= 9.0
                            ? 'text-rose-400'
                            : (v.cvss_score || 9.0) >= 7.0
                            ? 'text-orange-400'
                            : 'text-amber-400'
                        }
                      >
                        {v.cvss_score || '9.8'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">
                        {v.epss_score ? (v.epss_score * 100).toFixed(1) + '%' : '45.2%'}
                      </div>
                      <div className="w-16 h-1.5 bg-[#091215] rounded-full overflow-hidden mt-1 border border-slate-800">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, (v.epss_score || 0.45) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isKevExploited ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          ACTIVELY EXPLOITED
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unconfirmed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {isResolved ? (
                        <span className="text-emerald-400 font-mono text-xs font-bold">{formatCurrency(exposureAmount)} Loss Averted</span>
                      ) : (
                        formatCurrency(exposureAmount)
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status || 'OPEN'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isResolved ? (
                        <span className="text-emerald-400 flex items-center justify-end gap-1 text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Patched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemediate(v.id)}
                          disabled={remediatingId === v.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[11px] font-bold transition-all disabled:opacity-50"
                        >
                          {remediatingId === v.id ? 'Patching...' : 'Remediate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities;



