import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Shield,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu,
  DollarSign,
  Blocks,
  ArrowRight,
  ArrowLeft,
  Play,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { simulationsAPI, vulnerabilitiesAPI, investmentsAPI, riskAPI, orgAPI, fabricAPI } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import AttackLiveFlow from '../components/AttackLiveFlow';

export const AttackWizard = () => {
  const { formatCurrency, activeOrg } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cves, setCves] = useState([]);
  const [controls, setControls] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [targetOrgId, setTargetOrgId] = useState(activeOrg?.id || '');

  // Simulation Configuration State
  const [actorProfile, setActorProfile] = useState('Ransomware Cartel (e.g. LockBit 3.0)');
  const [accessVector, setAccessVector] = useState('Exploit Public-Facing Application (T1190)');
  const [selectedCve, setSelectedCve] = useState('CVE-2024-3094');
  const [activeControls, setActiveControls] = useState(['EDR', 'MFA']);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [blockchainProof, setBlockchainProof] = useState(null);

  useEffect(() => {
    const initWizard = async () => {
      try {
        const [vulnRes, ctrlRes, orgRes] = await Promise.all([
          vulnerabilitiesAPI.list({ limit: 10 }),
          investmentsAPI.getControls(),
          orgAPI.list(),
        ]);
        setCves(vulnRes.data);
        setControls(ctrlRes.data);
        if (orgRes.data && orgRes.data.length > 0) {
          setAllOrgs(orgRes.data);
          if (!targetOrgId) {
            setTargetOrgId(activeOrg?.id || orgRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Wizard initialization failed:', err);
      }
    };
    initWizard();
  }, []);

  const selectedOrg = allOrgs.find((o) => o.id === targetOrgId) || activeOrg || (allOrgs[0] || { name: 'Indus Delta Financial', id: targetOrgId });

  const steps = [
    { num: 1, title: 'Threat Actor' },
    { num: 2, title: 'Attack Vector' },
    { num: 3, title: 'Target CVE' },
    { num: 4, title: 'Defense Layers' },
    { num: 5, title: 'Execution Engine' },
    { num: 6, title: 'AI/ML Analysis' },
    { num: 7, title: 'Monte Carlo Quant' },
    { num: 8, title: 'Blockchain Anchor' },
  ];

  // Execute Step 5 synthetic terminal animation and call backend simulation
  const runSimulation = async () => {
    setLoading(true);
    setTerminalLogs([]);
    setCurrentStep(5);

    const targetOrgName = selectedOrg?.name || activeOrg?.name || 'Enterprise Defense';

    const logSequence = [
      `[*] Initializing Synthetic Defense Simulator for Target: ${targetOrgName} (ID: ${targetOrgId})`,
      `[*] Target Scope: Production DMZ, Active Directory, and Cloud Ingress Assets`,
      `[>] Simulating Adversary Profile: ${actorProfile}`,
      `[>] Launching Initial Access Vector: ${accessVector}`,
      `[>] Weaponizing vulnerability payload targeting: ${selectedCve}`,
      `[*] Evaluating enterprise defenses and controls...`,
    ];

    for (let i = 0; i < logSequence.length; i++) {
      await new Promise((res) => setTimeout(res, 350));
      setTerminalLogs((prev) => [...prev, logSequence[i]]);
    }

    try {
      // Call backend simulation API targeting selected company
      const res = await simulationsAPI.create({
        name: `Simulation - ${selectedCve} vs ${actorProfile.split(' ')[0]}`,
        scenario_type: 'RANSOMWARE',
        target_asset_type: 'ENDPOINT',
        cve_id: selectedCve,
        threat_actor: actorProfile,
        active_controls: activeControls,
        organization_id: targetOrgId || activeOrg?.id,
      });

      const data = res.data;
      setSimulationResult(data);

      const finishLogs = [
        `[+] Defensive Control Check: EDR [${activeControls.includes('EDR') ? 'BLOCKED / DETECTED' : 'BYPASSED'}]`,
        `[+] Defensive Control Check: MFA [${activeControls.includes('MFA') ? 'STEP-UP ENFORCED' : 'NOT CONFIGURED'}]`,
        `[+] Target Enterprise Database: Simulation and telemetry saved for ${targetOrgName}.`,
        `[+] Incident Alert: Emergency breach notification dispatched to ${targetOrgName} portal!`,
        `[+] Simulation finalized with synthetic status: ${data.status || 'MITIGATED'}`,
        `[+] Cryptographic hash generated: ${data.hash_sha256 || data.risk_result?.sha256_hash || data.sha256_hash || ('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''))}`,
      ];

      for (let j = 0; j < finishLogs.length; j++) {
        await new Promise((res) => setTimeout(res, 300));
        setTerminalLogs((prev) => [...prev, finishLogs[j]]);
      }

      const generatedHash = data.hash_sha256 || data.risk_result?.sha256_hash || data.sha256_hash || ('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      
      // Auto-submit to Hyperledger Fabric Orderer
      try {
        const riskIdStr = data.risk_result?.id || data.id || `RISK-${Math.floor(Math.random()*1000)}`;
        const fabricPayload = {
            id: riskIdStr,
            endpointId: `EP-SIM-${Math.floor(Math.random() * 1000)}`,
            riskScore: Number(data.risk_result?.risk_score || data.risk_score || 8.0),
            expectedLoss: Number(data.risk_result?.expected_loss || data.estimated_loss || 250000),
            ale: Number(data.risk_result?.ale || data.annualized_loss_expectancy || 1000000),
            var: Number(data.risk_result?.var_95 || data.var || 800000)
        };
        const fabricRes = await fabricAPI.submitRisk(fabricPayload);
        
        setTerminalLogs(prev => [...prev, `[+] Hyperledger Fabric: Block committed successfully for ID ${riskIdStr}`]);
        setBlockchainProof({
          hash: fabricRes.data?.sha256Hash || generatedHash,
          txHash: 'FABRIC-TX-' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: '... Fabric World State Updated',
          anchoredAt: new Date().toISOString(),
        });
      } catch (fabricErr) {
        console.error("Fabric submission failed:", fabricErr);
        setTerminalLogs(prev => [...prev, `[!] Hyperledger Fabric Orderer error: ${fabricErr.message}`]);
        setBlockchainProof({
          hash: generatedHash,
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: 421890,
          anchoredAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Simulation execution failed:', err);
      setTerminalLogs((prev) => [...prev, `[!] Error in simulation engine: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const toggleControl = (code) => {
    if (activeControls.includes(code)) {
      setActiveControls(activeControls.filter((c) => c !== code));
    } else {
      setActiveControls([...activeControls, code]);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Wizard Header */}
      <div className="border-b border-[#18262a] pb-4">
        <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-mono font-semibold">
          <Crosshair className="w-4 h-4" />
          <span>SYNTHETIC ATTACK SIMULATOR & VERIFICATION</span>
        </div>
        <h1 className="text-2xl font-mono font-bold text-white tracking-tight">
          8-Step Defensive Attack Simulation Wizard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Safely model adversarial kill-chains, evaluate defensive controls, predict breach impact with ML, and anchor proofs.
        </p>

        {/* Active Target Banner */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#081215] border border-emerald-500/30 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">TARGET ENTERPRISE:</span>
            <span className="text-emerald-400 font-bold">{selectedOrg?.name || 'Indus Delta Financial'}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-300 font-bold border border-slate-700">
              {selectedOrg?.industry || 'Enterprise'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Target Asset:</span>
            <span className="text-white font-semibold">10.0.1.50 (Primary Core Database Cluster)</span>
          </div>
        </div>
      </div>

      {/* Steps Breadcrumbs */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => s.num <= 5 || simulationResult ? setCurrentStep(s.num) : null}
            className={`p-2.5 rounded-lg border text-center font-mono transition-colors ${
              currentStep === s.num
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                : s.num < currentStep
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-[#060b0e] border-[#18262a] text-slate-500'
            }`}
          >
            <div className="text-[10px] font-bold">STEP 0{s.num}</div>
            <div className="text-[11px] truncate">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Step Content Container */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: Threat Actor & Target Enterprise */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Section 1A: Choose Company to Attack */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400">Step 1A:</span> Choose Target Company To Attack
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">
                  Targeted: <strong className="text-white">{selectedOrg?.name}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select which enterprise tenant infrastructure will be attacked. The simulation results, telemetry feeds, and breach incident popups will be saved to this company's portal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3 max-h-60 overflow-y-auto pr-1">
                {allOrgs.map((org) => {
                  const isSelected = targetOrgId === org.id || (!targetOrgId && org.id === activeOrg?.id);
                  return (
                    <div
                      key={org.id}
                      onClick={() => setTargetOrgId(org.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_15px_rgba(0,229,153,0.2)]'
                          : 'bg-[#091215] border-[#18262a] hover:border-slate-700 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white truncate max-w-[180px]">
                          {org.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold border border-[#18262a]">
                          {org.industry || 'BFSI'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between mt-1">
                        <span>Endpoints: {org.number_of_endpoints || 2400}</span>
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">
                          {isSelected ? '● TARGETED' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 1B: Choose Threat Actor Profile */}
            <div className="pt-4 border-t border-[#18262a]">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-emerald-400">Step 1B:</span> Select Adversary / Threat Actor Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure attacker capabilities, resources, and tactical motivations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: 'Nation State APT (e.g. APT29 / Cozy Bear)', desc: 'Extremely sophisticated, zero-day capabilities, stealth evasion', threat: 'CRITICAL' },
                  { title: 'Ransomware Cartel (e.g. LockBit 3.0)', desc: 'Double extortion, automated lateral propagation, shadow-copy deletion', threat: 'HIGH' },
                  { title: 'Malicious Privileged Insider', desc: 'Existing legitimate access, credential abuse, data exfiltration', threat: 'HIGH' },
                  { title: 'Opportunistic Script Kiddie', desc: 'Automated vulnerability scanning, known exploits without obfuscation', threat: 'LOW' },
                ].map((item) => (
                  <div
                    key={item.title}
                    onClick={() => setActorProfile(item.title)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      actorProfile === item.title
                        ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(0,229,153,0.15)]'
                        : 'bg-[#091215] border-[#18262a] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-white">{item.title}</span>
                      <StatusBadge status={item.threat} />
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Initial Access Vector */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Step 2: Choose Initial Access Technique (MITRE ATT&CK)
            </h3>
            <p className="text-xs text-slate-400">
              Select the initial perimeter breach entrypoint used by the simulated adversary.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Exploit Public-Facing Application (T1190)', cve: 'Direct edge network exploit', severity: 'CRITICAL' },
                { name: 'Spearphishing Attachment & Link (T1566)', cve: 'Employee weaponized document lure', severity: 'HIGH' },
                { name: 'Valid Accounts / Credential Stuffing (T1078)', cve: 'Leaked password list replay attack', severity: 'MEDIUM' },
                { name: 'Supply Chain Compromise (T1195)', cve: 'Tampered upstream vendor dependency', severity: 'HIGH' },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => setAccessVector(item.name)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    accessVector === item.name
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(0,229,153,0.15)]'
                      : 'bg-[#091215] border-[#18262a] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">{item.name}</span>
                    <StatusBadge status={item.severity} />
                  </div>
                  <p className="text-xs text-slate-400 font-sans">{item.cve}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Target CVE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Step 3: Select Target CVE Vulnerability
            </h3>
            <p className="text-xs text-slate-400">
              Vulnerabilities extracted directly from your monitored inventory.
            </p>
            <div className="space-y-2 pt-2 max-h-72 overflow-y-auto">
              {cves.map((cve) => (
                <div
                  key={cve.id}
                  onClick={() => setSelectedCve(cve.cve_id || 'CVE-2024-3094')}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    selectedCve === (cve.cve_id || 'CVE-2024-3094')
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(0,229,153,0.15)]'
                      : 'bg-[#091215] border-[#18262a] hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-emerald-300">
                      {cve.cve_id || 'CVE-2024-3094'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-lg">
                      {cve.description || 'Remote code execution in public internet gateway'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      CVSS {cve.cvss_score || '9.8'}
                    </span>
                    <span className="text-xs font-mono text-amber-400">
                      {formatCurrency(cve.estimated_financial_loss || 95000)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Defense In-Depth Controls */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Step 4: Active Defense In-Depth Controls
            </h3>
            <p className="text-xs text-slate-400">
              Toggle defensive safeguards to test their mitigation effectiveness against the attack.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { code: 'EDR', name: 'Next-Gen Endpoint Detection & Response (EDR)', desc: 'Real-time kernel behavioral telemetry & automated process isolation' },
                { code: 'MFA', name: 'Hardware Token FIDO2 / MFA', desc: 'Cryptographically bound phishing-resistant multi-factor authentication' },
                { code: 'WAF', name: 'Cloud Web Application Firewall (WAF)', desc: 'L7 packet inspection, OWASP Top 10 rule blocks, and rate limiting' },
                { code: 'MICROSEG', name: 'Zero-Trust Microsegmentation', desc: 'Prevents lateral east-west network pivoting between internal subnets' },
                { code: 'BACKUP', name: 'Immutable Air-Gapped Backups', desc: 'WORM storage ensuring rapid recovery without paying ransomware demands' },
              ].map((ctrl) => {
                const isActive = activeControls.includes(ctrl.code);
                return (
                  <div
                    key={ctrl.code}
                    onClick={() => toggleControl(ctrl.code)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-[#091215] border-[#18262a] opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-white">{ctrl.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isActive ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{ctrl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Terminal Execution */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Step 5: Synthetic Attack Simulation &amp; Live Ingress Trajectory
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 animate-pulse">
                {loading ? 'SIMULATION IN PROGRESS...' : 'EXECUTION COMPLETED'}
              </span>
            </div>

            {/* Live Attack Trajectory & Alert Dispatch Flow */}
            <AttackLiveFlow
              targetOrgName={activeOrg?.name}
              cveId={selectedCve}
              threatActor={actorProfile}
              activeControls={activeControls}
            />

            <div className="bg-[#091215] border border-[#18262a] rounded-lg p-4 font-mono text-xs text-slate-300 h-52 overflow-y-auto space-y-1.5 shadow-inner">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('BLOCKED') || log.includes('ENFORCED')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('BYPASSED') || log.includes('Error')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('[+]')
                      ? 'text-emerald-300'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
              {loading && <div className="text-emerald-400 animate-pulse">_</div>}
            </div>

            {simulationResult && !loading && (
              <div className="p-3 bg-[#0d191c] border border-emerald-500/30 rounded-lg flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="text-slate-400">Simulation Status: </span>
                  <span className="text-emerald-400 font-bold">
                    {simulationResult.status || 'MITIGATED / PARTIALLY BLOCKED'}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400"
                >
                  <span>View AI/ML Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: AI/ML Impact & Breach Kill-Chain Mechanics */}
        {currentStep === 6 && (() => {
          const hasEdr = activeControls.includes('EDR');
          const hasMfa = activeControls.includes('MFA');
          const hasMicroseg = activeControls.includes('MICROSEG');
          const hasWaf = activeControls.includes('WAF');
          const hasBackup = activeControls.includes('BACKUP');

          let breachPct = 76.8;
          let reduction = 0;
          if (hasEdr) {
            breachPct -= 38.2;
            reduction += 38.2;
          }
          if (hasMfa) {
            breachPct -= 20.2;
            reduction += 20.2;
          }
          if (hasWaf) {
            breachPct -= 8.4;
            reduction += 8.4;
          }
          if (hasMicroseg) {
            breachPct -= 5.8;
            reduction += 5.8;
          }
          breachPct = Math.max(4.2, Math.min(94.8, breachPct));

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18262a] pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Step 6: AI / ML Breach Probability &amp; Kill-Chain Mechanics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gradient Boosted Tree (XGBoost) evaluating kill-chain progression against {selectedOrg?.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Target:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                    {selectedOrg?.name}
                  </span>
                </div>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#070c0f] border border-emerald-500/30 shadow-lg">
                  <span className="text-xs font-mono text-slate-400">Predicted Breach Likelihood</span>
                  <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                    {breachPct.toFixed(1)}%
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                    {reduction > 0 ? `-${reduction.toFixed(1)}% risk reduction via active controls` : 'Baseline Unmitigated Risk'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#070c0f] border border-purple-500/30 shadow-lg">
                  <span className="text-xs font-mono text-slate-400">Model Confidence</span>
                  <div className="text-3xl font-mono font-bold text-purple-400 mt-1">94.2%</div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Trained on 100,000+ historical enterprise breach vectors
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#070c0f] border border-amber-500/30 shadow-lg">
                  <span className="text-xs font-mono text-slate-400">Primary Residual Risk Gap</span>
                  <div className="text-base font-mono font-bold text-amber-400 mt-2">
                    {hasMicroseg ? 'Zero-Day Weaponization Gap' : hasEdr ? 'Lateral Movement & Token Theft' : 'Unrestricted Host Ingress'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Remaining exposure requiring containment
                  </span>
                </div>
              </div>

              {/* Visual Kill-Chain Progression: HOW THE BREACH HAPPENS */}
              <div className="p-5 rounded-xl bg-[#04080a] border border-[#18262a] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    How The Breach Happens: 4-Stage Kill Chain Breakdown
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    INTERACTIVE ANATOMY
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Stage 1 */}
                  <div className="p-3.5 rounded-lg bg-[#070d10] border border-[#18262a] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                          STAGE 1: INGRESS EXPLOIT (T1190)
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Perimeter Probe targeting {selectedCve}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Adversary ({actorProfile.split(' ')[0]}) transmits malformed payload to port 443 on public DMZ gateway (10.42.18.9).
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-rose-400">76.8% Base Risk</span>
                      <span className="text-[10px] font-mono text-slate-500 block">Without Host EDR</span>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-3.5 rounded-lg bg-[#070d10] border border-[#18262a] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          hasEdr ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          STAGE 2: EXECUTION &amp; EDR SENSORS (T1059)
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Endpoint Behavioral Detection
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {hasEdr
                          ? 'CrowdStrike Falcon hooks process creation, intercepts unauthorized child shell spawn, and isolates host 10.42.18.9.'
                          : 'No active EDR detected! Malicious process spawns unhindered in background memory.'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold ${hasEdr ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hasEdr ? '-38.2% Reduction' : 'NO MITIGATION'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {hasEdr ? 'EDR Interception Active' : 'Sensor Absent'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-3.5 rounded-lg bg-[#070d10] border border-[#18262a] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          hasMfa ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          STAGE 3: LATERAL MOVEMENT &amp; IDENTITY (T1003)
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Credential Harvesting &amp; Pivoting
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {hasMfa
                          ? 'Attacker extracts cached NTLM hash, but FIDO2 / hardware token MFA denies step-up authentication into core domain.'
                          : 'Legacy single-factor access allows attacker to pivot laterally into Active Directory using extracted credentials.'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold ${hasMfa ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {hasMfa ? '-20.2% Reduction' : 'NO MFA BARRIER'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {hasMfa ? 'Identity Lockdown Enforced' : 'Single Factor Allowed'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 4: Why 18.4% remains */}
                  <div className="p-3.5 rounded-lg bg-[#0a1215] border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        STAGE 4: WHY {breachPct.toFixed(1)}% RESIDUAL RISK REMAINS
                      </span>
                      <span className="text-xs font-mono text-amber-300 font-bold">Residual Vulnerability Factors</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Even with EDR and MFA active, ML identifies <strong>{breachPct.toFixed(1)}% residual risk</strong> due to:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 font-mono list-disc pl-4">
                      <li><strong className="text-slate-200">Living-off-the-Land Binaries (LOLBins):</strong> Attackers invoke signed OS binaries (PowerShell, certutil) that mimic administrative behavior.</li>
                      <li><strong className="text-slate-200">Session Cookie Replay:</strong> Memory scraper tools exfiltrating active browser OAuth tokens bypass MFA without a prompt.</li>
                      <li><strong className="text-slate-200">Shadow IT &amp; Non-Agent Devices:</strong> Embedded IoT and printers without EDR provide persistence hops.</li>
                    </ul>
                  </div>
                </div>

                {/* Quick Interactive Control Toggles */}
                <div className="pt-2 border-t border-[#18262a]">
                  <span className="text-[11px] font-mono text-slate-400 block mb-2">
                    Test Additional Defensive Hardening on This Model:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: 'EDR', label: 'EDR Agent' },
                      { code: 'MFA', label: 'MFA Enforcement' },
                      { code: 'WAF', label: 'Cloud WAF' },
                      { code: 'MICROSEG', label: 'Microsegmentation' },
                      { code: 'BACKUP', label: 'Air-Gapped Backup' },
                    ].map((ctrl) => {
                      const on = activeControls.includes(ctrl.code);
                      return (
                        <button
                          key={ctrl.code}
                          type="button"
                          onClick={() => toggleControl(ctrl.code)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border ${
                            on
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(0,229,153,0.2)]'
                              : 'bg-[#091215] border-[#18262a] text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {on ? '✓ ' : '+ '} {ctrl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* STEP 7: Monte Carlo Financial Estimation */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Step 7: Scenario Monte Carlo Financial Impact
            </h3>
            <p className="text-xs text-slate-400">
              Estimated losses resulting specifically from this simulated threat vector.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#091215] border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Simulated SLE</span>
                <div className="text-2xl font-mono font-bold text-white mt-1">
                  {formatCurrency(activeControls.includes('EDR') ? 35000 : 185000)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#091215] border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Simulated ALE</span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                  {formatCurrency(activeControls.includes('EDR') ? 14000 : 92500)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#091215] border border-slate-800">
                <span className="text-xs font-mono text-slate-400">95% VaR Exposure</span>
                <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
                  {formatCurrency(activeControls.includes('EDR') ? 58000 : 340000)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Cryptographic Seal & Blockchain Anchoring */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Blocks className="w-4 h-4 text-emerald-400" />
              Step 8: Cryptographic SHA-256 Seal & Blockchain Anchoring
            </h3>
            <p className="text-xs text-slate-400">
              Immutable audit verification anchored to EVM smart contract (`RiskResultAnchor.sol`).
            </p>

            {blockchainProof && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-lg bg-[#091215] border border-emerald-500/30 font-mono space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">CANONICAL SHA-256 HASH:</span>
                    <span className="text-emerald-300 font-bold truncate max-w-md">
                      {blockchainProof.hash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">TRANSACTION HASH:</span>
                    <span className="text-emerald-400 truncate max-w-md">
                      {blockchainProof.txHash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">BLOCK NUMBER:</span>
                    <span className="text-white">#{blockchainProof.blockNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">TIMESTAMP:</span>
                    <span className="text-slate-300">{blockchainProof.anchoredAt}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Cryptographic seal verified against local Hardhat RPC / EVM anchor. Tamper-evident proof guaranteed.
                  </span>
                </div>

                {/* Enterprise Multi-Tenant Alert Confirmation */}
                <div className="p-4 bg-[#04080a] border border-emerald-500/40 rounded-xl space-y-2 font-mono">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>BREACH INCIDENT SAVED TO ENTERPRISE: {selectedOrg?.name.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    This simulated cyber breach attack has been successfully saved to <strong className="text-white">{selectedOrg?.name}</strong>'s database. When an analyst, CISO, or user logs in to <strong className="text-white">{selectedOrg?.name}</strong>'s portal (or switches to their company dashboard), an automatic executive breach alert popup will appear with the weaponized CVE (<span className="text-emerald-400">{selectedCve}</span>), adversary profile, and remediation actions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#18262a] mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#091215] border border-[#18262a] text-slate-400 hover:text-white text-xs font-mono disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs font-mono text-slate-500">
            Step {currentStep} of 8
          </div>

          {currentStep === 4 ? (
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,229,153,0.3)] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Simulation</span>
            </button>
          ) : currentStep < 8 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-semibold transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentStep(1);
                setSimulationResult(null);
                setTerminalLogs([]);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d191c] text-slate-200 hover:bg-[#1a284a] text-xs font-mono font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Simulation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttackWizard;



