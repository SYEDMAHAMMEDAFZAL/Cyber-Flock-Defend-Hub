"""
Cyber Flock Defense Hub - Risk Engine
Formulas and logic for Enterprise Cybersecurity Risk Quantification:
SLE (Single Loss Expectancy), ARO (Annualized Rate of Occurrence),
ALE (Annualized Loss Expectancy), VaR (Value at Risk: 90%, 95%, 99%),
Loss categorization, and Currency toggles.
"""

from typing import Dict, Any, Optional

USD_TO_INR_RATE = 83.50

def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """Converts between INR and USD based on fixed baseline exchange rate."""
    if from_currency == to_currency:
        return amount
    if from_currency.upper() == "USD" and to_currency.upper() == "INR":
        return round(amount * USD_TO_INR_RATE, 2)
    elif from_currency.upper() == "INR" and to_currency.upper() == "USD":
        return round(amount / USD_TO_INR_RATE, 2)
    return amount

def calculate_sle(asset_value: float, exposure_factor: float) -> float:
    """
    Single Loss Expectancy (SLE) = Asset Value * Exposure Factor (EF)
    Exposure Factor: 0.01 to 1.0
    """
    ef = max(0.01, min(1.0, exposure_factor))
    return round(asset_value * ef, 2)

def calculate_aro(threat_frequency_per_year: float, vulnerability_exploitability: float, control_mitigation_pct: float) -> float:
    """
    Annualized Rate of Occurrence (ARO)
    Estimates estimated occurrences per year taking into account threat activity,
    vulnerability exploitability (0.0 to 1.0), and active control mitigations (0.0 to 100.0%).
    """
    base_threat = max(0.05, threat_frequency_per_year)
    exploit_factor = max(0.1, min(1.0, vulnerability_exploitability))
    mitigation_factor = max(0.05, 1.0 - (min(95.0, control_mitigation_pct) / 100.0 * 0.85))
    
    aro = base_threat * exploit_factor * mitigation_factor
    return round(max(0.02, min(50.0, aro)), 3)

def calculate_ale(sle: float, aro: float) -> float:
    """Annualized Loss Expectancy (ALE) = SLE * ARO"""
    return round(sle * aro, 2)

def calculate_risk_score(
    cvss_score: float,
    asset_criticality: str,
    threat_likelihood: float,
    control_coverage_pct: float,
    epss_score: Optional[float] = None
) -> float:
    """
    Quantifies overall cyber risk into an enterprise risk index between 0.0 and 100.0.
    """
    criticality_weights = {
        "MISSION_CRITICAL": 1.4,
        "CRITICAL": 1.25,
        "HIGH": 1.0,
        "MEDIUM": 0.75,
        "LOW": 0.45
    }
    crit_weight = criticality_weights.get(asset_criticality.upper(), 1.0)
    
    cvss_pts = (min(10.0, max(0.0, cvss_score)) / 10.0) * 35.0
    
    if epss_score is not None:
        epss_pts = min(1.0, max(0.0, epss_score)) * 15.0
    else:
        epss_pts = (cvss_score / 10.0) * 10.0
        
    threat_pts = min(1.0, max(0.0, threat_likelihood)) * 25.0
    control_deficit_pts = (1.0 - (min(100.0, max(0.0, control_coverage_pct)) / 100.0)) * 25.0
    
    raw_score = (cvss_pts + epss_pts + threat_pts + control_deficit_pts) * crit_weight
    normalized_score = round(max(5.0, min(99.5, raw_score)), 1)
    return normalized_score

def calculate_var(ale: float, confidence_level: float = 0.95) -> float:
    """Value at Risk (VaR) estimation based on annual loss expectation."""
    z_scores = {
        0.90: 1.645,
        0.95: 2.15,
        0.99: 3.45
    }
    multiplier = z_scores.get(confidence_level, 2.0)
    return round(ale * multiplier, 2)

def calculate_business_loss_breakdown(total_loss: float) -> Dict[str, float]:
    """Decomposes financial cyber loss into specific enterprise cost components."""
    ratios = {
        "downtime_cost": 0.28,
        "recovery_cost": 0.20,
        "incident_response_cost": 0.14,
        "data_impact_cost": 0.18,
        "operational_loss": 0.10,
        "compliance_legal_cost": 0.10
    }
    
    breakdown = {}
    running_total = 0.0
    for key, ratio in ratios.items():
        amount = round(total_loss * ratio, 2)
        breakdown[key] = amount
        running_total += amount
        
    diff = round(total_loss - running_total, 2)
    breakdown["downtime_cost"] = round(breakdown["downtime_cost"] + diff, 2)
    breakdown["total_estimated_loss"] = total_loss
    return breakdown

def quantify_comprehensive_risk(
    asset_value: float,
    exposure_factor: float = 0.65,
    cvss_score: float = 7.5,
    epss_score: Optional[float] = 0.45,
    asset_criticality: str = "HIGH",
    threat_frequency: float = 1.2,
    control_coverage_pct: float = 70.0,
    control_mitigation_pct: float = 65.0,
    currency: str = "INR"
) -> Dict[str, Any]:
    """Performs full deterministic risk calculation pipeline."""
    sle = calculate_sle(asset_value, exposure_factor)
    vulnerability_exploitability = cvss_score / 10.0
    aro = calculate_aro(threat_frequency, vulnerability_exploitability, control_mitigation_pct)
    ale = calculate_ale(sle, aro)
    risk_score = calculate_risk_score(cvss_score, asset_criticality, min(1.0, threat_frequency / 2.0), control_coverage_pct, epss_score)
    
    var_90 = calculate_var(ale, 0.90)
    var_95 = calculate_var(ale, 0.95)
    var_99 = calculate_var(ale, 0.99)
    
    breakdown = calculate_business_loss_breakdown(sle)
    
    return {
        "risk_score": risk_score,
        "single_loss_expectancy": sle,
        "annualized_rate_of_occurrence": aro,
        "annualized_loss_expectancy": ale,
        "var_90": var_90,
        "var_95": var_95,
        "var_99": var_99,
        "currency": currency,
        **breakdown
    }

