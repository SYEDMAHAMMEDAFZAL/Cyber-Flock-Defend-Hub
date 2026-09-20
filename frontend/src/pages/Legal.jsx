import React from 'react';
import { Shield, BookOpen, AlertTriangle, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const Legal = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#18262a] pb-4">
        <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-mono font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>LEGAL, COMPLIANCE & ETHICAL ASSURANCE</span>
        </div>
        <h1 className="text-2xl font-mono font-bold text-white tracking-tight">
          Terms of Service & Synthetic Simulation Disclaimer
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Governance policies, defensive ethical boundaries, synthetic simulation attestation, and data confidentiality.
        </p>
      </div>

      {/* Synthetic Simulation Disclaimer Box */}
      <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>MANDATORY DEFENSIVE & SYNTHETIC DATA NOTICE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          CYBER FLOCK DEFENSE HUB is exclusively designed for defensive risk quantification, cyber financial exposure analysis, and synthetic attack simulation. All adversarial scenarios, CVE weaponization logs, and telemetry alerts executed within this platform are generated through in-process synthetic mathematical models. All generated records are strictly tagged with <code className="text-amber-300 font-mono">is_simulated = True</code>.
        </p>
      </div>

      {/* Section 1: Ethical Use & Authorized Operations */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          1. Authorized & Defensive Use Only (IT Act 2000, Sections 43 & 66)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This software is designated as a dual-use defensive security tool. It must only be operated on systems, networks, and environments owned by the licensee or for which explicit, written authorization (Rules of Engagement) has been granted by the executive asset owner. Unauthorized use to target, penetrate, probe, or disrupt third-party networks is strictly prohibited. Violations constitute criminal offenses under <strong>Section 43 (Penalty and Compensation for damage to computer, computer system)</strong>, <strong>Section 66 (Computer Related Offences)</strong>, and <strong>Section 66F (Cyber Terrorism)</strong> of the <strong>Information Technology Act, 2000 (India)</strong>, alongside the Bharatiya Nyaya Sanhita (BNS) provisions against digital trespass.
        </p>
      </div>

      {/* Section 2: Data Confidentiality & Screenshot Deterrence */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          2. Data Fiduciary Obligations & Privacy (DPDP Act 2023)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          CYBER FLOCK DEFENSE HUB operates as a Data Fiduciary in strict accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong>. All ingested Personally Identifiable Information (PII), SIEM logs, and endpoint telemetry are synthetically anonymized and processed exclusively under the basis of "Legitimate Use" (Section 7). To enforce data confidentiality and prevent visual exfiltration (shoulder-surfing/screen scraping), we mandate automated client-side screenshot deterrence policies. Monitored screens render diagonal dynamic forensic watermarks containing the active user's authenticated work email, IP address, and real-time timestamp, ensuring compliance with <strong>Section 8 (Data Fiduciary Obligations)</strong> to protect personal data from breaches.
        </p>
      </div>

      {/* Section 3: CERT-In Reporting */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          3. Mandatory Incident Reporting (CERT-In Directions 2022)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          In compliance with the <strong>CERT-In Directions 2022</strong> issued under <strong>Section 70B(6) of the IT Act, 2000</strong>, all enterprise tenants utilizing this platform are legally obligated to report severe cyber security incidents (including ransomware, data breaches, and APT activity) to the Indian Computer Emergency Response Team (CERT-In) within <strong>6 hours</strong> of noticing such incidents. CYBER FLOCK maintains NTP-synchronized logging infrastructure (maintained for a rolling 180-day period) to assist enterprises in fulfilling these mandatory forensic reporting requirements.
        </p>
      </div>

      {/* Section 4: Cryptographic Integrity */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          4. Cryptographic Hashing & Evidentiary Value (IT Act Sections 3 & 4)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          All executive audit reports and simulation results generate a canonical deterministic SHA-256 hash. These cryptographic signatures are permanently anchored to Hyperledger Fabric and Ethereum Virtual Machine (EVM) smart contracts. This mathematical immutability provides evidentiary value recognized under <strong>Section 3 (Authentication of electronic records)</strong>, <strong>Section 4 (Legal recognition of electronic records)</strong>, and <strong>Section 65B of the Indian Evidence Act (now Bharatiya Sakshya Adhiniyam)</strong>, ensuring tamper-evidence for external regulatory compliance and board-level audit presentations.
        </p>
      </div>

      {/* Section 5: Export Controls */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          5. Export Controls & SCOMET Compliance (DGFT)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          As a platform incorporating advanced cryptographic encryption and network simulation capabilities, CYBER FLOCK DEFENSE HUB is subject to the export control regulations of the <strong>Directorate General of Foreign Trade (DGFT), India</strong> under the <strong>SCOMET (Special Chemicals, Organisms, Materials, Equipment and Technologies) List</strong> (specifically Category 8). The transfer, export, or deployment of this software to embargoed nations or prohibited entities is strictly forbidden.
        </p>
      </div>

      {/* Section 6: Limitation of Liability */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          6. Actuarial Risk Estimation & Safe Harbor (IT Act Section 79)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Calculations of Single Loss Expectancy (SLE), Annualized Loss Expectancy (ALE), and Value at Risk (VaR) utilize empirical FAIR frameworks and compound stochastic Monte Carlo simulations. Under standard Safe Harbor provisions (including <strong>Section 79 of the IT Act</strong>), these statistical estimations serve purely as risk quantification guidance for capital allocation. CYBER FLOCK DEFENSE HUB and its Executive Director, S.MD.AFZAL, do not constitute an actuarial insurance guarantee, nor do they warrant zero breach liability.
        </p>
      </div>
    </div>
  );
};

export default Legal;


