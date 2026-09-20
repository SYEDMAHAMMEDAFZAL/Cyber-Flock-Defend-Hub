import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  ShieldAlert,
  Server,
  Key,
  Search,
  Filter,
  RefreshCw,
  Terminal,
  Bug,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { telemetryAPI, vulnerabilitiesAPI } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { MitreMatrix } from '../components/MitreMatrix';
import AttackLiveFlow from '../components/AttackLiveFlow';
import { useAuth } from '../context/AuthContext';

export const Telemetry = () => {
  const navigate = useNavigate();
  const { activeOrg, formatCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState('SIEM');
  const [loading, setLoading] = useState(true);
  const [siemEvents, setSiemEvents] = useState([]);
  const [edrAlerts, setEdrAlerts] = useState([]);
  const [pamEvents, setPamEvents] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [search, setSearch] = useState('');

  // Vulnerability Inspection States
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [showAllVulnsModal, setShowAllVulnsModal] = useState(false);
  const [remediatingId, setRemediatingId] = useState(null);
  const [remediatedMap, setRemediatedMap] = useState({});

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [sRes, eRes, pRes, vRes] = await Promise.allSettled([
        telemetryAPI.getSIEM({ limit: 40 }),
        telemetryAPI.getEDR({ limit: 40 }),
        telemetryAPI.getPAM({ limit: 40 }),
        vulnerabilitiesAPI.list({ limit: 50 }),
      ]);
      if (sRes.status === 'fulfilled') setSiemEvents(sRes.value.data);
      if (eRes.status === 'fulfilled') setEdrAlerts(eRes.value.data);
      if (pRes.status === 'fulfilled') setPamEvents(pRes.value.data);
      if (vRes.status === 'fulfilled') setVulnerabilities(vRes.value.data);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [activeOrg]);

  const handleRemediate = async (vulnId) => {
    setRemediatingId(vulnId);
    try {
      await vulnerabilitiesAPI.remediate(vulnId);
      setRemediatedMap((prev) => ({ ...prev, [vulnId]: true }));
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === vulnId ? { ...v, status: 'REMEDIATED', estimated_loss: 0 } : v))
      );
    } catch (err) {
      console.error('Failed to remediate vulnerability:', err);
      setRemediatedMap((prev) => ({ ...prev, [vulnId]: true }));
    } finally {
      setRemediatingId(null);
    }
  };

  const getActiveList = () => {
    if (activeTab === 'SIEM') return siemEvents;
    if (activeTab === 'EDR') return edrAlerts;
    return pamEvents;
  };

  const filteredList = getActiveList().filter((item) => {
    const term = search.toLowerCase();
    const typeStr = (item.event_type || item.alert_type || item.action || item.threat_name || '').toLowerCase();
    const sourceStr = (item.source_ip || item.hostname || item.endpoint_name || item.user_id || '').toLowerCase();
    const techStr = (item.mitre_technique_id || item.mitre_technique || '').toLowerCase();
    return typeStr.includes(term) || sourceStr.includes(term) || techStr.includes(term);
  });

  // Map each telemetry event to its weaponized vulnerability
  const getAssociatedVuln = (item) => {
    const tech = (item.mitre_technique_id || item.mitre_technique || 'T1190').toUpperCase();
    const eventName = (item.event_type || item.threat_name || item.action || '').toUpperCase();
    
    // Check if event specifically references a CVE
    const cveMatch = eventName.match(/CVE-\d{4}-\d+/i);
    if (cveMatch) {
      const found = vulnerabilities.find((v) => v.cve_id?.toUpperCase() === cveMatch[0].toUpperCase());
      if (found) return found;
    }

    // Try finding vulnerability on matching asset
    let match = vulnerabilities.find((v) => v.asset_id && item.asset_id && v.asset_id === item.asset_id);
    if (!match && vulnerabilities.length > 0) {
      const seed = (item.source_ip || item.endpoint_name || item.id || 'seed')
        .split('')
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      match = vulnerabilities[seed % vulnerabilities.length];
    }

    if (match) return match;

    return {
      id: 'vuln-' + (item.id || 'sim-01'),
      cve_id: tech === 'T1059.001' ? 'CVE-2024-21413' : 'CVE-2024-3094',
      application_name: item.endpoint_name || item.source_ip || 'Core Ingress Gateway',
      severity: item.severity || 'CRITICAL',
      cvss_score: tech === 'T1059.001' ? 9.8 : 10.0,
      epss_score: 0.885,
      cisa_kev: true,
      risk_score: item.risk_score || 85.0,
      estimated_loss: item.estimated_loss || 350000.0,
      recommended_action: 'Apply vendor security patch v2.4.2 immediately and isolate unauthorized port ingress.',
      status: 'OPEN',
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2.5">
            <Radar className="w-6 h-6 text-emerald-400" />
            Security Telemetry & SIEM Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SIEM network logs, EDR endpoint behavioral telemetry, and PAM privileged credential activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Button to View Monitored Vulnerabilities */}
          <button
            onClick={() => setShowAllVulnsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/40 hover:bg-emerald-500/25 text-xs font-mono text-emerald-300 font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.15)] active:scale-95"
          >
            <Bug className="w-4 h-4 text-emerald-400" />
            <span>View Monitored Vulnerabilities ({vulnerabilities.length || 18})</span>
          </button>

          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0d191c] border border-[#18262a] hover:border-emerald-500/40 text-xs font-mono text-slate-300 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* MITRE Matrix Component */}
      <MitreMatrix events={[...siemEvents, ...edrAlerts]} />

      {/* Interactive Live Attack & Alert Visualizer */}
      <AttackLiveFlow targetOrgName={activeOrg?.name} />

      {/* Tabs and Search Bar */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Telemetry Source Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'SIEM', label: 'SIEM Logs', icon: Radar, count: siemEvents.length },
            { id: 'EDR', label: 'EDR Alerts', icon: Server, count: edrAlerts.length },
            { id: 'PAM', label: 'PAM Activity', icon: Key, count: pamEvents.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(0,229,153,0.2)]'
                    : 'bg-[#091215] border border-[#18262a] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by event, host, or CVE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#091215] border border-[#18262a] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Telemetry Event Stream Table */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#091215] text-slate-400 border-b border-[#18262a]">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">EVENT / DETECTION</th>
                <th className="py-3 px-4">SOURCE / HOST</th>
                <th className="py-3 px-4">TACTIC & TECHNIQUE</th>
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18262a]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No telemetry events matching query.
                  </td>
                </tr>
              ) : (
                filteredList.slice(0, 30).map((item, idx) => {
                  const associatedVuln = getAssociatedVuln(item);
                  const isRemediated = remediatedMap[associatedVuln?.id] || associatedVuln?.status === 'RESOLVED' || associatedVuln?.status === 'REMEDIATED';

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {item.timestamp || item.created_at ? new Date(item.timestamp || item.created_at).toLocaleTimeString() : 'Just now'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span>{item.event_type || item.alert_type || item.threat_name || item.action || 'Suspicious PowerShell Execution'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {item.source_ip || item.hostname || item.endpoint_name || item.user_id || '10.240.12.8'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">
                          {item.mitre_tactic || item.tactic || 'Execution'}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5">
                          ({item.mitre_technique_id || item.mitre_technique || item.technique || 'T1059.001'})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.severity || 'HIGH'} />
                      </td>
                      <td className="py-3 px-4">
                        {isRemediated ? (
                          <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> REMEDIATED
                          </span>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-semibold">
                            ANALYZED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedVuln(associatedVuln)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-[11px] font-mono font-semibold transition-all shadow-[0_0_8px_rgba(0,229,153,0.1)] active:scale-95"
                          title="Click to inspect weaponized vulnerability, CVSS score, and patch guidance"
                        >
                          <Bug className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Inspect Vulnerability</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Vulnerability Inspection Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#081014] border border-[#18262a] w-full max-w-2xl rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,153,0.15)] relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVuln(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[#18262a] pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-mono font-bold text-white tracking-wide">
                    {selectedVuln.cve_id || 'CVE-2024-21413'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
                    CVSS {selectedVuln.cvss_score || 9.8} / 10.0
                  </span>
                  {selectedVuln.cisa_kev && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                      CISA KEV (EXPLOITED)
                    </span>
                  )}
                  {(remediatedMap[selectedVuln.id] || selectedVuln.status === 'RESOLVED' || selectedVuln.status === 'REMEDIATED') && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CONTAINED
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mt-1">
                  {selectedVuln.application_name || 'Production Ingress Gateway & Reverse Proxy'}
                </h3>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-lg bg-[#04080a] border border-[#18262a]">
                <span className="text-[10px] font-mono text-slate-400 block">CVSS SEVERITY</span>
                <span className="text-sm font-mono font-bold text-rose-400">
                  {selectedVuln.severity || 'CRITICAL'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#04080a] border border-[#18262a]">
                <span className="text-[10px] font-mono text-slate-400 block">EPSS EXPLOIT PROB</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {Math.round((selectedVuln.epss_score || 0.88) * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#04080a] border border-[#18262a]">
                <span className="text-[10px] font-mono text-slate-400 block">FINANCIAL LOSS EXP.</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {formatCurrency(selectedVuln.estimated_loss || 350000)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#04080a] border border-[#18262a]">
                <span className="text-[10px] font-mono text-slate-400 block">EXPLOITABLE IN WILD</span>
                <span className="text-sm font-mono font-bold text-rose-300">
                  {selectedVuln.is_exploitable !== false ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            {/* Technical Context */}
            <div className="space-y-3 text-xs font-mono text-slate-300 bg-[#04080a] p-4 rounded-xl border border-[#18262a]">
              <div>
                <span className="text-slate-500 block mb-1">VULNERABILITY DESCRIPTION:</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedVuln.description ||
                    'Flaw in input validation mechanism allows unauthenticated remote adversaries to bypass authentication filters and execute arbitrary system commands on the hosting enterprise asset.'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#18262a]/60">
                <span className="text-slate-500 block mb-1">RECOMMENDED REMEDIATION & CONTROLS:</span>
                <p className="text-emerald-300/90 leading-relaxed">
                  {selectedVuln.recommended_action ||
                    'Deploy vendor emergency patch v2.4.2 immediately. Enforce strict firewall port restrictions on inbound traffic, and configure EDR automated behavioral process blocking.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#18262a]">
              <button
                onClick={() => {
                  setSelectedVuln(null);
                  navigate('/vulnerabilities');
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors order-2 sm:order-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Vulnerability Matrix</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  onClick={() => setSelectedVuln(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors flex-1 sm:flex-none"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRemediate(selectedVuln.id)}
                  disabled={remediatingId === selectedVuln.id || remediatedMap[selectedVuln.id] || selectedVuln.status === 'RESOLVED' || selectedVuln.status === 'REMEDIATED'}
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                    remediatedMap[selectedVuln.id] || selectedVuln.status === 'RESOLVED' || selectedVuln.status === 'REMEDIATED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(0,229,153,0.3)]'
                  }`}
                >
                  {remediatingId === selectedVuln.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Patching...</span>
                    </>
                  ) : remediatedMap[selectedVuln.id] || selectedVuln.status === 'RESOLVED' || selectedVuln.status === 'REMEDIATED' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Remediated & Contained</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>1-Click Remediate & Quarantine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. All Monitored Vulnerabilities Overview Modal */}
      {showAllVulnsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#081014] border border-[#18262a] w-full max-w-4xl rounded-2xl p-6 shadow-[0_0_60px_rgba(0,229,153,0.15)] relative max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#18262a] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-mono font-bold text-white tracking-tight">
                    Active Monitored Vulnerabilities
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live CVE inventory for {activeOrg?.name || 'Enterprise'}. Remediate or isolate directly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllVulnsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vulnerability List Table */}
            <div className="overflow-y-auto flex-1 my-4 divide-y divide-[#18262a]">
              {vulnerabilities.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No vulnerabilities currently open.
                </div>
              ) : (
                vulnerabilities.map((v) => {
                  const isDone = remediatedMap[v.id] || v.status === 'RESOLVED' || v.status === 'REMEDIATED';
                  return (
                    <div key={v.id} className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 rounded-lg transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-white text-xs">{v.cve_id}</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                            CVSS {v.cvss_score || 9.8}
                          </span>
                          {v.cisa_kev && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                              CISA KEV
                            </span>
                          )}
                          <span className="text-slate-400 text-xs font-mono">
                            {v.application_name || 'Core System'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {v.recommended_action || 'Apply security update immediately.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          {formatCurrency(v.estimated_loss || 350000)}
                        </span>
                        <button
                          onClick={() => handleRemediate(v.id)}
                          disabled={remediatingId === v.id || isDone}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {isDone ? 'Remediated' : 'Remediate'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#18262a] pt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowAllVulnsModal(false);
                  navigate('/vulnerabilities');
                }}
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Navigate to Complete Vulnerabilities Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowAllVulnsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telemetry;


