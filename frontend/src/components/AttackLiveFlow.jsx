import React, { useState, useEffect, useRef } from 'react';
import {
  Crosshair,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Terminal,
  Radio,
  AlertTriangle,
  Play,
  RotateCcw,
  Bell,
  Mail,
  Zap,
  CheckCircle2,
  ArrowRight,
  Wifi,
} from 'lucide-react';

export const AttackLiveFlow = ({
  targetOrgName = 'Zenith Logistics & Maritime',
  cveId = 'CVE-2024-21413',
  threatActor = 'LockBit 3.0 Ransomware Cartel',
  activeControls = ['EDR', 'MFA', 'WAF'],
}) => {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);
  const [liveLogs, setLiveLogs] = useState([]);

  const stages = [
    {
      id: 'origin',
      title: '1. Adversary Origin',
      subtitle: threatActor,
      icon: Crosshair,
      color: 'rose',
      status: 'WEAPONIZED',
      detail: 'Adversary builds weaponized exploit payload targeting perimeter assets.',
    },
    {
      id: 'perimeter',
      title: '2. WAF & Boundary Inspection',
      subtitle: 'Edge Gateway (Port 443 / HTTPS)',
      icon: Radio,
      color: 'amber',
      status: activeControls.includes('WAF') ? 'INSPECTING' : 'BYPASSED',
      detail: 'TLS stream decrypted and evaluated against deep packet inspection signatures.',
    },
    {
      id: 'target',
      title: '3. Target Asset Ingress',
      subtitle: `${targetOrgName} Core Cluster`,
      icon: Server,
      color: 'purple',
      status: 'EXPLOIT TRIGGERED',
      detail: `Target host (10.42.18.9) probed for ${cveId} memory buffer overflow flaw.`,
    },
    {
      id: 'edr',
      title: '4. SIEM & EDR Interception',
      subtitle: 'CrowdStrike Falcon + Splunk ES',
      icon: ShieldAlert,
      color: 'emerald',
      status: 'DETECTED (T1190)',
      detail: 'Endpoint sensor catches unauthorized child process spawning; behavioral AI alerts.',
    },
    {
      id: 'alert',
      title: '5. Automated SOC Alert',
      subtitle: 'Company CISO & Incident Response',
      icon: Bell,
      color: 'emerald',
      status: 'DISPATCHED',
      detail: 'Encrypted PagerDuty & SIEM alert immediately delivered to the company defense team.',
    },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      if (activeStage < stages.length - 1) {
        timer = setTimeout(() => {
          setActiveStage((prev) => prev + 1);
          setPacketProgress((prev) => prev + 25);
        }, 1200);
      } else {
        setIsPlaying(false);
        setAlertDispatched(true);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStage]);

  // Log generation based on stage
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    if (activeStage === 0) {
      setLiveLogs([
        `[${timestamp}] [ADVERSARY] Threat Actor "${threatActor}" armed payload for ${cveId}`,
      ]);
    } else if (activeStage === 1) {
      setLiveLogs((prev) => [
        ...prev,
        `[${timestamp}] [PERIMETER] Ingress SYN flood & HTTP POST payload passed through Edge Proxy (185.220.101.5 -> 10.42.18.9)`,
      ]);
    } else if (activeStage === 2) {
      setLiveLogs((prev) => [
        ...prev,
        `[${timestamp}] [TARGET ASSET] Service hook intercepted: Memory offset mismatch on daemon (10.42.18.9)`,
      ]);
    } else if (activeStage === 3) {
      setLiveLogs((prev) => [
        ...prev,
        `[${timestamp}] [SIEM/EDR] MITRE ATT&CK T1190 identified! EDR agent quarantines process PID 4819`,
      ]);
    } else if (activeStage === 4) {
      setLiveLogs((prev) => [
        ...prev,
        `[${timestamp}] [SOC DISPATCH] P1 CRITICAL ALERT emailed to CISO & On-Call SecOps for ${targetOrgName}!`,
      ]);
    }
  }, [activeStage]);

  const handleStart = () => {
    setActiveStage(0);
    setPacketProgress(0);
    setAlertDispatched(false);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setActiveStage(0);
    setPacketProgress(0);
    setIsPlaying(false);
    setAlertDispatched(false);
    setLiveLogs([]);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#060b0e] border border-[#18262a] space-y-6">
      {/* UPSIDE TOP-LEVEL REAL-TIME SOC ALERT BANNER */}
      {alertDispatched && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-[#0a1418] to-emerald-950/60 border-2 border-rose-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50 text-[10px] font-mono font-bold tracking-wider uppercase">
                  🚨 REAL-TIME SOC ALERT DISPATCHED
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  DELIVERY STATUS: 100% SENT
                </span>
              </div>
              <h4 className="font-mono text-sm font-bold text-white mt-1">
                Exploit Ingress Blocked on {targetOrgName} &bull; Alert Emailed to CISO &amp; SOC Lead
              </h4>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Target IP <span className="font-mono text-rose-300 font-bold">10.42.18.9</span> quarantined by CrowdStrike Falcon agent. Urgent notice dispatched to <strong className="text-emerald-300 font-mono">ciso@{targetOrgName.toLowerCase().replace(/[^a-z]/g, '')}.com</strong> and on-call response team.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs shrink-0 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>EMAIL &amp; SIEM SEALED</span>
            </span>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#18262a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-mono text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Live Attack Simulation &amp; Alert Flow Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time trajectory from Threat Origin &rarr; Network Ingress &rarr; Target Host &rarr; SIEM Interception &rarr; Automated Alert Dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleStart}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,153,0.3)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlaying ? 'Simulating Attack...' : 'Launch Live Visual Flow'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#0e1a1d] hover:bg-[#15272c] border border-[#18262a] text-slate-300 text-xs transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Visual Network Topology Flow */}
      <div className="relative">
        {/* Connecting Progress Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-[#101b1e] rounded-full hidden md:block z-0">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${(activeStage / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* 5 Stage Node Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeStage === idx;
            const isPassed = activeStage > idx;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#0a1518] border-emerald-400 ring-1 ring-emerald-400/50 shadow-[0_0_15px_rgba(0,229,153,0.2)]'
                    : isPassed
                    ? 'bg-[#081013] border-emerald-500/40 text-slate-300'
                    : 'bg-[#060b0e] border-[#18262a] text-slate-500 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400'
                        : isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#0e1a1d] text-slate-500 border border-[#18262a]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isPassed
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-[#0e1a1d] text-slate-600'
                    }`}
                  >
                    STAGE {idx + 1}
                  </span>
                </div>

                <div>
                  <h4 className="font-mono text-xs font-bold text-white truncate">
                    {st.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {st.subtitle}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#18262a] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">STATE:</span>
                  <span
                    className={`font-bold ${
                      st.color === 'rose'
                        ? 'text-rose-400'
                        : st.color === 'amber'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Alert Popup Banner if alertDispatched */}
      {alertDispatched && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-[#061215] to-[#061215] border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-bounce duration-1000 shadow-[0_0_25px_rgba(0,229,153,0.25)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                  HIGH SEVERITY INCIDENT
                </span>
                <span className="font-mono text-xs text-slate-300">
                  REF: INC-2026-X981
                </span>
              </div>
              <h4 className="font-mono text-sm font-bold text-white mt-0.5">
                Automated Incident Alert Dispatched to {targetOrgName} SOC &amp; CISO
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                Adversary payload intercepted by CrowdStrike sensor. Host quarantined, FAIR compound loss recalculated.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              ALERT DELIVERED
            </span>
          </div>
        </div>
      )}

      {/* Terminal Live Packet Log Stream */}
      <div className="rounded-xl bg-[#04070a] border border-[#18262a] p-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYNTHETIC PACKET &amp; TELEMETRY STREAM</span>
          </div>
          <span className="text-emerald-400 text-[10px]">
            {isPlaying ? 'BURST ACTIVE' : 'STANDBY'}
          </span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[11px]">
          {liveLogs.length === 0 ? (
            <div className="text-slate-600 italic">
              Click &quot;Launch Live Visual Flow&quot; to observe synthetic packet weaponization and defense telemetry...
            </div>
          ) : (
            liveLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('[ADVERSARY]')
                    ? 'text-rose-400'
                    : log.includes('[PERIMETER]')
                    ? 'text-amber-400'
                    : log.includes('[SOC DISPATCH]')
                    ? 'text-emerald-300 font-bold'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttackLiveFlow;
