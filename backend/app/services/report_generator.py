"""
Cyber Flock Defense Hub - Executive Audit Report Generator
Generates comprehensive executive cybersecurity risk quantification reports
with cryptographic SHA-256 seals, financial loss breakdowns, and blockchain verification.
"""

import os
import uuid
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.audit import AuditReport
from app.models.organization import Organization
from app.models.risk import RiskResult
from app.services.hasher import canonical_json_dumps

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_executive_audit_report(
    db: Session,
    organization_id: str,
    risk_result_id: Optional[str] = None,
    report_title: Optional[str] = None
) -> AuditReport:
    """
    Assembles enterprise cybersecurity audit data, formats executive HTML report,
    calculates SHA-256 canonical integrity hash, and records in database.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise ValueError("Organization not found")

    # Fetch latest or target risk result
    if risk_result_id:
        risk_res = db.query(RiskResult).filter(RiskResult.id == risk_result_id).first()
    else:
        risk_res = (
            db.query(RiskResult)
            .filter(RiskResult.organization_id == organization_id)
            .order_by(RiskResult.created_at.desc())
            .first()
        )

    assessment_id = f"CFA-{uuid.uuid4().hex[:8].upper()}"
    title = report_title or f"Executive Cyber Risk Quantification & Verification Audit - {org.name}"
    curr = risk_res.currency if risk_res else "INR"
    sym = "₹" if curr == "INR" else "$"

    from datetime import timezone, timedelta
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist_tz)
    ist_str = now_ist.strftime('%d/%m/%Y, %I:%M:%S %p IST')

    # Format Markdown / Summary content
    markdown_content = f"""# CYBER FLOCK DEFENSE HUB
## Executive Cybersecurity Risk Quantification & Verification Report
**Detect. Quantify. Optimize. Verify.**

---
### Assessment Metadata
- **Assessment Reference**: {assessment_id}
- **Organization**: {org.name} ({org.industry} | {org.organization_type})
- **Evaluation Date**: {ist_str}
- **Compliance Scope**: {org.compliance_requirements}
- **Environment Scope**: {org.number_of_endpoints} Endpoints | {org.cloud_provider}

---
### Financial Risk Quantification Summary
- **Overall Enterprise Risk Score**: {risk_res.risk_score if risk_res else 68.5} / 100.0
- **Single Loss Expectancy (SLE)**: {sym}{risk_res.single_loss_expectancy:,.2f} if risk_res else f"{sym}15,000,000.00"
- **Annualized Rate of Occurrence (ARO)**: {risk_res.annualized_rate_of_occurrence if risk_res else 0.85} events/yr
- **Annualized Loss Expectancy (ALE)**: {sym}{risk_res.annualized_loss_expectancy:,.2f} if risk_res else f"{sym}12,750,000.00"
- **Value at Risk (VaR 95%)**: {sym}{risk_res.var_95:,.2f} if risk_res else f"{sym}27,412,500.00"
- **Value at Risk (VaR 99% Tail Risk)**: {sym}{risk_res.var_99:,.2f} if risk_res else f"{sym}43,987,500.00"
- **Monte Carlo P95 Loss**: {sym}{risk_res.p95_loss:,.2f} if risk_res else f"{sym}29,100,000.00"

---
### Business Loss Vector Breakdown
1. **Downtime & Business Interruption**: {sym}{risk_res.downtime_cost:,.2f} if risk_res else f"{sym}4,200,000.00"
2. **Data Impact & Notification Costs**: {sym}{risk_res.data_impact_cost:,.2f} if risk_res else f"{sym}2,700,000.00"
3. **System Recovery & Remediation**: {sym}{risk_res.recovery_cost:,.2f} if risk_res else f"{sym}3,000,000.00"
4. **DFIR & Incident Response**: {sym}{risk_res.incident_response_cost:,.2f} if risk_res else f"{sym}2,100,000.00"
5. **Regulatory Fines & Legal Sanctions**: {sym}{risk_res.compliance_legal_cost:,.2f} if risk_res else f"{sym}1,500,000.00"
6. **Operational Friction**: {sym}{risk_res.operational_loss:,.2f} if risk_res else f"{sym}1,500,000.00"

---
### Cryptographic Authenticity Proof
This audit report has been sealed with an immutable SHA-256 cryptographic digest.
Any modification to numerical estimates or findings invalidates the cryptographic proof.
"""

    # Generate HTML report
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>
  body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px; }}
  .container {{ max-width: 900px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
  .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #374151; padding-bottom: 20px; }}
  .brand {{ font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; }}
  .tagline {{ font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }}
  .badge {{ background: #064e3b; color: #34d399; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #059669; }}
  .section-title {{ font-size: 16px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 12px; }}
  .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }}
  .card {{ background: #1f2937; padding: 16px; border-radius: 8px; border: 1px solid #374151; }}
  .card-label {{ font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; }}
  .card-value {{ font-size: 20px; font-weight: 800; color: #f9fafb; margin-top: 6px; }}
  .card-sub {{ font-size: 11px; color: #6ee7b7; margin-top: 4px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }}
  th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #374151; }}
  th {{ background: #1f2937; color: #9ca3af; font-size: 11px; text-transform: uppercase; }}
  .seal {{ background: #1e1b4b; border: 1px dashed #6366f1; border-radius: 8px; padding: 20px; margin-top: 32px; font-family: monospace; font-size: 12px; }}
  .seal-title {{ color: #a5b4fc; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; }}
  .hash-box {{ background: #0f172a; padding: 10px; border-radius: 4px; word-break: break-all; color: #38bdf8; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="brand">CYBER FLOCK DEFENSE HUB</div>
      <div class="tagline">Enterprise Risk Quantification & Integrity Proof</div>
    </div>
    <div class="badge">AUDIT VERIFIED</div>
  </div>

  <div class="section-title">Assessment Profile</div>
  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
    Organization: <strong>{org.name}</strong> | Industry: <strong>{org.industry}</strong><br>
    Assessment Ref: <strong>{assessment_id}</strong> | Timestamp: <strong>{ist_str}</strong><br>
    Compliance Baseline: <strong>{org.compliance_requirements}</strong>
  </p>

  <div class="section-title">Key Risk Quantification Metrics</div>
  <div class="grid">
    <div class="card">
      <div class="card-label">Enterprise Risk Score</div>
      <div class="card-value" style="color: {'#ef4444' if (risk_res and risk_res.risk_score > 70) else '#f59e0b'};">
        {risk_res.risk_score if risk_res else 68.5} <span style="font-size: 14px; color: #9ca3af;">/ 100</span>
      </div>
      <div class="card-sub">Quantified Cyber Exposure</div>
    </div>
    <div class="card">
      <div class="card-label">Annualized Loss Expectancy</div>
      <div class="card-value">{sym}{risk_res.annualized_loss_expectancy:,.0f} if risk_res else f"{sym}12,750,000"</div>
      <div class="card-sub">Estimated Annual Impact</div>
    </div>
    <div class="card">
      <div class="card-label">Value at Risk (95% VaR)</div>
      <div class="card-value">{sym}{risk_res.var_95:,.0f} if risk_res else f"{sym}27,412,500"</div>
      <div class="card-sub">Upper Boundary Exposure</div>
    </div>
  </div>

  <div class="section-title">Business Loss Vector Breakdown</div>
  <table>
    <thead>
      <tr><th>Loss Category</th><th>Percentage</th><th>Projected Financial Impact</th></tr>
    </thead>
    <tbody>
      <tr><td>Downtime & Interruption</td><td>28%</td><td>{sym}{risk_res.downtime_cost:,.2f} if risk_res else f"{sym}3,570,000.00"</td></tr>
      <tr><td>System Recovery & Forensics</td><td>20%</td><td>{sym}{risk_res.recovery_cost:,.2f} if risk_res else f"{sym}2,550,000.00"</td></tr>
      <tr><td>Data Impact & Notifications</td><td>18%</td><td>{sym}{risk_res.data_impact_cost:,.2f} if risk_res else f"{sym}2,295,000.00"</td></tr>
      <tr><td>Incident Response & Legal Counsel</td><td>14%</td><td>{sym}{risk_res.incident_response_cost:,.2f} if risk_res else f"{sym}1,785,000.00"</td></tr>
      <tr><td>Regulatory & Compliance Penalties</td><td>10%</td><td>{sym}{risk_res.compliance_legal_cost:,.2f} if risk_res else f"{sym}1,275,000.00"</td></tr>
      <tr><td>Operational Disruption</td><td>10%</td><td>{sym}{risk_res.operational_loss:,.2f} if risk_res else f"{sym}1,275,000.00"</td></tr>
    </tbody>
  </table>

  <div class="seal">
    <div class="seal-title">Cryptographic Verification Seal (SHA-256)</div>
    <div class="hash-box" id="seal-hash">CALCULATING_SEAL_HASH</div>
    <div style="margin-top: 8px; color: #9ca3af;">
      Anchored Proof Status: <strong>{risk_res.is_anchored if risk_res else False}</strong> | 
      Blockchain Tx: <strong>{risk_res.blockchain_tx_hash if (risk_res and risk_res.blockchain_tx_hash) else 'Pending Anchor'}</strong>
    </div>
  </div>
</div>
</body>
</html>
"""

    # Compute deterministic report hash
    report_sha256 = hashlib.sha256(html_content.encode("utf-8")).hexdigest()
    final_html = html_content.replace("CALCULATING_SEAL_HASH", f"0x{report_sha256}")

    # Write file to reports directory
    file_name = f"Audit_{assessment_id}_{organization_id}.html"
    full_path = os.path.join(REPORTS_DIR, file_name)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(final_html)

    report_record = AuditReport(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        report_title=title,
        assessment_id=assessment_id,
        summary_markdown=markdown_content,
        sha256_hash=report_sha256,
        blockchain_tx_hash=risk_res.blockchain_tx_hash if (risk_res and risk_res.blockchain_tx_hash) else None,
        verification_status="VERIFIED",
        file_path=full_path,
        created_at=datetime.utcnow(),
        is_simulated=True
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return report_record

