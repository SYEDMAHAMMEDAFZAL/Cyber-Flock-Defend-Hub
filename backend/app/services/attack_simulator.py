"""
Cyber Flock Defense Hub - 8-Step Attack Simulation & Risk Execution Engine
Executes synthetic multi-stage attack simulations, assesses security control defenses,
and chains Monte Carlo loss modeling, ML risk prediction, and cryptographic hashing.
"""

import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.assets import Asset
from app.models.vulnerabilities import Vulnerability
from app.models.simulation import Simulation, SimulationStatus, SecurityControl, AttackTechnique, AttackPath
from app.models.risk import RiskResult, LossDistribution
from app.models.audit import HashRecord
from app.services.risk_engine import quantify_comprehensive_risk
from app.services.monte_carlo import run_monte_carlo_simulation
from app.services.hasher import generate_risk_result_hash
from app.services.ml_engine import predict_cyber_risk

STEP_DEFINITIONS = [
    {"step": 1, "name": "Reconnaissance & Asset Profiling", "tactic": "Reconnaissance", "technique_id": "T1595"},
    {"step": 2, "name": "Initial Access Vector", "tactic": "Initial Access", "technique_id": "T1190"},
    {"step": 3, "name": "Execution & Code Invocation", "tactic": "Execution", "technique_id": "T1059"},
    {"step": 4, "name": "Defense Evasion & Obfuscation", "tactic": "Defense Evasion", "technique_id": "T1562"},
    {"step": 5, "name": "Persistence & Privilege Escalation", "tactic": "Privilege Escalation", "technique_id": "T1078"},
    {"step": 6, "name": "Credential Access & Lateral Movement", "tactic": "Lateral Movement", "technique_id": "T1021"},
    {"step": 7, "name": "Defensive Control Interception", "tactic": "Mitigation Assessment", "technique_id": "N/A"},
    {"step": 8, "name": "Impact Execution & Business Loss Quantification", "tactic": "Impact", "technique_id": "T1486"}
]

def execute_attack_simulation(
    db: Session,
    organization_id: str,
    user_id: Optional[str],
    simulation_name: str,
    asset_id: str,
    technique_id: str = "T1190",
    vulnerability_id: Optional[str] = None,
    attack_path_id: Optional[str] = None,
    selected_control_codes: List[str] = None,
    iterations: int = 10000,
    threat_actor: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the full 8-step attack simulation pipeline against the specified asset.
    """
    selected_control_codes = selected_control_codes or []
    
    # Fetch asset
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.organization_id == organization_id).first()
    if not asset:
        # If specific asset not found, find any asset for org or create fallback
        asset = db.query(Asset).filter(Asset.organization_id == organization_id).first()
        if not asset:
            asset = Asset(
                id=str(uuid.uuid4()),
                organization_id=organization_id,
                name="Primary Production Database Cluster",
                asset_type="DATABASE",
                criticality="CRITICAL",
                ip_address="10.0.1.50",
                financial_value=75000.0,
                is_simulated=True
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)

    # Fetch vulnerability if provided
    vuln = None
    if vulnerability_id:
        vuln = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
    
    cvss_score = vuln.cvss_score if vuln else 8.2
    epss_score = vuln.epss_score if vuln else 0.48
    raw_val = getattr(asset, "financial_value", getattr(asset, "estimated_value_inr", 75000.0))
    # Keep normalized in B2B enterprise thousands range ($25K - $95K)
    asset_val = (raw_val % 75000.0) + 25000.0 if raw_val > 150000.0 else raw_val
    crit_val = asset.criticality.value if hasattr(asset.criticality, "value") else str(asset.criticality)

    # Evaluate selected security controls
    active_controls = (
        db.query(SecurityControl)
        .filter(SecurityControl.code.in_(selected_control_codes))
        .all()
    ) if selected_control_codes else []

    # Calculate cumulative mitigation and defense efficacy
    combined_mitigation_pct = 0.0
    for ctrl in active_controls:
        combined_mitigation_pct += ctrl.risk_reduction_percent * ctrl.effectiveness_score
    combined_mitigation_pct = min(92.0, combined_mitigation_pct)
    
    control_coverage_pct = 85.0 if active_controls else 35.0

    # Step-by-step synthetic simulation execution log
    step_logs = []
    accumulated_defense_points = 0.0
    
    for defn in STEP_DEFINITIONS:
        s_num = defn["step"]
        if s_num <= 6:
            status = "COMPLETED"
            detail = f"Adversary synthetic procedure executed for tactic {defn['tactic']} ({defn['technique_id']})."
        elif s_num == 7:
            # Control evaluation step
            if active_controls:
                blocked_pct = round(combined_mitigation_pct, 1)
                status = "INTERCEPTED"
                detail = f"Active controls ({', '.join(c.code for c in active_controls)}) reduced breach probability by {blocked_pct}%."
            else:
                status = "UNMITIGATED"
                detail = "No active controls selected for interception; lateral compromise uninhibited."
        else: # Step 8: Impact & Loss
            status = "QUANTIFIED"
            detail = "Calculated stochastic financial exposure using Monte Carlo compound distribution."

        step_logs.append({
            "step": s_num,
            "name": defn["name"],
            "tactic": defn["tactic"],
            "technique_id": defn["technique_id"],
            "status": status,
            "detail": detail,
            "timestamp": datetime.utcnow().isoformat()
        })

    # Execute deterministic risk engine
    risk_metrics = quantify_comprehensive_risk(
        asset_value=asset_val,
        exposure_factor=0.65 if not active_controls else 0.40,
        cvss_score=cvss_score,
        epss_score=epss_score,
        asset_criticality=crit_val,
        threat_frequency=1.35,
        control_coverage_pct=control_coverage_pct,
        control_mitigation_pct=combined_mitigation_pct,
        currency="INR"
    )

    # Execute Monte Carlo simulation (10,000 iterations)
    mc_results = run_monte_carlo_simulation(
        single_loss_expectancy=risk_metrics["single_loss_expectancy"],
        annualized_rate_of_occurrence=risk_metrics["annualized_rate_of_occurrence"],
        iterations=iterations
    )

    # Execute ML Risk Prediction
    ml_features = {
        "asset_criticality_factor": 2.5 if crit_val == "CRITICAL" else 1.8,
        "asset_value": asset_val,
        "cvss_score": cvss_score,
        "epss_score": epss_score,
        "active_controls_count": len(active_controls),
        "control_coverage_pct": control_coverage_pct,
        "siem_alert_volume": 14,
        "edr_threat_detections": 3,
        "pam_anomalies": 1,
        "is_cloud_asset": 1,
        "is_public_facing": 1
    }
    ml_prediction = predict_cyber_risk(ml_features)

    # Create Simulation Record
    sim_id = str(uuid.uuid4())
    sim_record = Simulation(
        id=sim_id,
        organization_id=organization_id,
        user_id=user_id,
        simulation_name=simulation_name,
        asset_id=asset.id,
        vulnerability_id=vuln.id if vuln else None,
        technique_id=technique_id,
        threat_actor=threat_actor or "Nation State APT (APT29 / Cozy Bear)",
        is_acknowledged=False,
        attack_path_id=attack_path_id,
        selected_control_codes=json.dumps(selected_control_codes),
        iterations=iterations,
        status=SimulationStatus.COMPLETED,
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        is_simulated=True
    )
    db.add(sim_record)

    # Create RiskResult Record
    risk_res_id = str(uuid.uuid4())
    risk_result = RiskResult(
        id=risk_res_id,
        simulation_id=sim_id,
        organization_id=organization_id,
        risk_score=risk_metrics["risk_score"],
        single_loss_expectancy=risk_metrics["single_loss_expectancy"],
        annualized_rate_of_occurrence=risk_metrics["annualized_rate_of_occurrence"],
        annualized_loss_expectancy=risk_metrics["annualized_loss_expectancy"],
        var_90=risk_metrics["var_90"],
        var_95=risk_metrics["var_95"],
        var_99=risk_metrics["var_99"],
        monte_carlo_mean_loss=mc_results["mean_loss"],
        monte_carlo_median_loss=mc_results["median_loss"],
        p90_loss=mc_results["p90_loss"],
        p95_loss=mc_results["p95_loss"],
        p99_loss=mc_results["p99_loss"],
        downtime_cost=risk_metrics["downtime_cost"],
        recovery_cost=risk_metrics["recovery_cost"],
        incident_response_cost=risk_metrics["incident_response_cost"],
        data_impact_cost=risk_metrics["data_impact_cost"],
        operational_loss=risk_metrics["operational_loss"],
        compliance_legal_cost=risk_metrics["compliance_legal_cost"],
        total_estimated_loss=risk_metrics["total_estimated_loss"],
        currency="INR",
        is_anchored=False,
        created_at=datetime.utcnow(),
        is_simulated=True
    )
    db.add(risk_result)

    # Compute Canonical SHA-256 Hash
    risk_dict = {
        "risk_score": risk_result.risk_score,
        "single_loss_expectancy": risk_result.single_loss_expectancy,
        "annualized_rate_of_occurrence": risk_result.annualized_rate_of_occurrence,
        "annualized_loss_expectancy": risk_result.annualized_loss_expectancy,
        "var_95": risk_result.var_95,
        "var_99": risk_result.var_99,
        "monte_carlo_mean_loss": risk_result.monte_carlo_mean_loss,
        "total_estimated_loss": risk_result.total_estimated_loss,
        "currency": risk_result.currency
    }
    sha256_hex, canonical_json_str = generate_risk_result_hash(risk_dict)
    risk_result.sha256_hash = sha256_hex

    # Create LossDistribution Record
    loss_dist = LossDistribution(
        id=str(uuid.uuid4()),
        risk_result_id=risk_res_id,
        bins_json=mc_results["bins_json"],
        frequencies_json=mc_results["frequencies_json"],
        percentiles_json=mc_results["percentiles_json"],
        created_at=datetime.utcnow()
    )
    db.add(loss_dist)

    # Create HashRecord for audit permanence
    hash_rec = HashRecord(
        id=str(uuid.uuid4()),
        result_id=risk_res_id,
        organization_id=organization_id,
        user_id=user_id,
        sha256_hash=sha256_hex,
        canonical_json=canonical_json_str,
        algorithm="SHA-256",
        data_version="1.0",
        created_at=datetime.utcnow()
    )
    db.add(hash_rec)

    # Ingest Incident Notification for the targeted organization
    from app.models.audit import Notification
    from app.models.telemetry import SIEMEvent, EDRAlert, DetectionStatus
    from app.models.assets import CriticalityLevel

    cve_display = vuln.cve_id if vuln else "CVE-2024-3094"
    actor_display = threat_actor or "Nation State APT (APT29 / Cozy Bear)"

    incident_notif = Notification(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        title=f"🚨 CRITICAL BREACH ATTACK: {simulation_name}",
        message=f"Threat Actor '{actor_display}' executed synthetic attack using {technique_id} targeting asset {asset.name} ({asset.ip_address}) weaponizing {cve_display}. Annualized Loss Expectancy exposure: INR {risk_metrics['annualized_loss_expectancy']:,.2f}.",
        severity="CRITICAL",
        target_role="ALL",
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(incident_notif)

    # Ingest simulated SIEM event
    siem_alert = SIEMEvent(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        asset_id=asset.id,
        event_type=f"Simulated Ingress Attack: {technique_id} ({cve_display})",
        severity=CriticalityLevel.CRITICAL,
        source_ip="185.220.101.42",
        destination_ip=asset.ip_address,
        destination_port=443,
        user_identity="synthetic_adversary",
        endpoint_name=asset.name,
        mitre_technique_id=technique_id,
        mitre_technique_name="Exploit Public-Facing Application" if technique_id == "T1190" else "Command & Scripting Interpreter",
        detection_status=DetectionStatus.DETECTED,
        risk_score=round(risk_metrics["risk_score"], 1),
        estimated_loss=round(risk_metrics["single_loss_expectancy"], 2),
        recommended_action=f"Apply immediate vendor patch for {cve_display} and isolate ingress on {asset.ip_address}.",
        timestamp=datetime.utcnow(),
        is_simulated=True
    )
    db.add(siem_alert)

    # Ingest simulated EDR alert
    edr_alert = EDRAlert(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        endpoint_name=asset.name,
        process_name="mimikatz.exe" if "T1003" in technique_id else "powershell.exe",
        process_path=f"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        command_line=f"powershell.exe -enc SQBFAFgA -Target {asset.ip_address} -Exploit {cve_display}",
        parent_process="cmd.exe",
        sha256_hash=sha256_hex,
        threat_name=f"Weaponized Exploit {cve_display} ({actor_display})",
        severity=CriticalityLevel.CRITICAL,
        mitre_technique_id=technique_id,
        is_blocked=len(active_controls) > 0,
        detection_status=DetectionStatus.CONTAINED if active_controls else DetectionStatus.DETECTED,
        timestamp=datetime.utcnow(),
        is_simulated=True
    )
    db.add(edr_alert)

    db.commit()
    db.refresh(sim_record)
    db.refresh(risk_result)

    return {
        "simulation": {
            "id": sim_record.id,
            "name": sim_record.simulation_name,
            "organization_id": sim_record.organization_id,
            "status": sim_record.status.value,
            "asset_name": asset.name,
            "asset_ip": asset.ip_address,
            "threat_actor": sim_record.threat_actor,
            "cve_id": cve_display,
            "technique_id": sim_record.technique_id,
            "is_acknowledged": sim_record.is_acknowledged,
            "iterations": iterations,
            "completed_at": sim_record.completed_at
        },
        "step_logs": step_logs,
        "risk_result": {
            "id": risk_result.id,
            "risk_score": risk_result.risk_score,
            "single_loss_expectancy": risk_result.single_loss_expectancy,
            "annualized_rate_of_occurrence": risk_result.annualized_rate_of_occurrence,
            "annualized_loss_expectancy": risk_result.annualized_loss_expectancy,
            "var_90": risk_result.var_90,
            "var_95": risk_result.var_95,
            "var_99": risk_result.var_99,
            "monte_carlo_mean_loss": risk_result.monte_carlo_mean_loss,
            "monte_carlo_median_loss": risk_result.monte_carlo_median_loss,
            "p90_loss": risk_result.p90_loss,
            "p95_loss": risk_result.p95_loss,
            "p99_loss": risk_result.p99_loss,
            "total_estimated_loss": risk_result.total_estimated_loss,
            "downtime_cost": risk_result.downtime_cost,
            "recovery_cost": risk_result.recovery_cost,
            "incident_response_cost": risk_result.incident_response_cost,
            "data_impact_cost": risk_result.data_impact_cost,
            "operational_loss": risk_result.operational_loss,
            "compliance_legal_cost": risk_result.compliance_legal_cost,
            "sha256_hash": risk_result.sha256_hash,
            "currency": risk_result.currency,
            "is_anchored": risk_result.is_anchored
        },
        "loss_distribution": {
            "bins": mc_results["bins"],
            "frequencies": mc_results["frequencies"],
            "percentiles": mc_results["percentiles"],
            "loss_exceedance_curve": mc_results["loss_exceedance_curve"]
        },
        "ml_risk_insights": ml_prediction
    }

