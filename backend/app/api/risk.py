import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User
from app.models.risk import RiskResult, LossDistribution
from app.schemas.risk import RiskResultResponse, LossDistributionResponse
from app.security.dependencies import get_current_user
from app.services.ml_engine import predict_cyber_risk
from app.services.risk_engine import convert_currency

router = APIRouter()

@router.get("/overview")
@router.get("/metrics")
def get_risk_overview(
    currency: str = "INR",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest_result = (
        db.query(RiskResult)
        .filter(RiskResult.organization_id == current_user.organization_id)
        .order_by(RiskResult.created_at.desc())
        .first()
    )
    if not latest_result:
        latest_result = db.query(RiskResult).order_by(RiskResult.created_at.desc()).first()

    rate = 1.0 if currency.upper() == "INR" else (1.0 / 83.50)

    if not latest_result:
        sle_val = round(22500000.0 * rate, 2)
        aro_val = 0.85
        ale_val = round(sle_val * aro_val, 2)
        return {
            "risk_score": 64.2,
            "sle": sle_val,
            "aro": aro_val,
            "ale": ale_val,
            "single_loss_expectancy": sle_val,
            "annualized_rate_of_occurrence": aro_val,
            "annualized_loss_expectancy": ale_val,
            "var_90": round(ale_val * 1.35, 2),
            "var_95": round(ale_val * 1.82, 2),
            "var_99": round(ale_val * 2.45, 2),
            "monte_carlo_mean_loss": round(ale_val * 1.05, 2),
            "monte_carlo_median_loss": round(ale_val * 0.95, 2),
            "p90_loss": round(ale_val * 1.35, 2),
            "p95_loss": round(ale_val * 1.82, 2),
            "p99_loss": round(ale_val * 2.45, 2),
            "total_estimated_loss": sle_val,
            "currency": currency.upper(),
            "is_simulated": True
        }

    sle_calc = round(latest_result.single_loss_expectancy * rate, 2)
    aro_calc = latest_result.annualized_rate_of_occurrence
    ale_calc = round(latest_result.annualized_loss_expectancy * rate, 2)

    return {
        "id": latest_result.id,
        "risk_score": latest_result.risk_score,
        "sle": sle_calc,
        "aro": aro_calc,
        "ale": ale_calc,
        "single_loss_expectancy": sle_calc,
        "annualized_rate_of_occurrence": aro_calc,
        "annualized_loss_expectancy": ale_calc,
        "var_90": round(latest_result.var_90 * rate, 2),
        "var_95": round(latest_result.var_95 * rate, 2),
        "var_99": round(latest_result.var_99 * rate, 2),
        "monte_carlo_mean_loss": round(latest_result.monte_carlo_mean_loss * rate, 2),
        "monte_carlo_median_loss": round(latest_result.monte_carlo_median_loss * rate, 2),
        "p90_loss": round(latest_result.p90_loss * rate, 2),
        "p95_loss": round(latest_result.p95_loss * rate, 2),
        "p99_loss": round(latest_result.p99_loss * rate, 2),
        "downtime_cost": round(latest_result.downtime_cost * rate, 2),
        "recovery_cost": round(latest_result.recovery_cost * rate, 2),
        "incident_response_cost": round(latest_result.incident_response_cost * rate, 2),
        "data_impact_cost": round(latest_result.data_impact_cost * rate, 2),
        "operational_loss": round(latest_result.operational_loss * rate, 2),
        "compliance_legal_cost": round(latest_result.compliance_legal_cost * rate, 2),
        "total_estimated_loss": round(latest_result.total_estimated_loss * rate, 2),
        "sha256_hash": latest_result.sha256_hash,
        "is_anchored": latest_result.is_anchored,
        "blockchain_tx_hash": latest_result.blockchain_tx_hash,
        "currency": currency.upper(),
        "created_at": latest_result.created_at,
        "is_simulated": True
    }

@router.get("/history")
def get_risk_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = (
        db.query(RiskResult)
        .filter(RiskResult.organization_id == current_user.organization_id)
        .order_by(RiskResult.created_at.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "created_at": r.created_at.strftime("%b %d"),
            "risk_score": r.risk_score,
            "ale": r.annualized_loss_expectancy,
            "var_95": r.var_95,
            "mean_loss": r.monte_carlo_mean_loss
        }
        for r in results
    ]

@router.get("/monte-carlo")
@router.get("/monte-carlo/{sim_id}")
@router.get("/distribution/{risk_result_id}")
def get_loss_distribution(
    sim_id: Optional[str] = None,
    risk_result_id: Optional[str] = None,
    iterations: int = 10000,
    currency: str = "USD",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.monte_carlo import run_monte_carlo_simulation
    target_id = sim_id or risk_result_id
    
    # Locate risk result
    r_obj = None
    if target_id:
        r_obj = db.query(RiskResult).filter(
            (RiskResult.id == target_id) | (RiskResult.simulation_id == target_id)
        ).first()
    
    if not r_obj:
        r_obj = (
            db.query(RiskResult)
            .filter(RiskResult.organization_id == current_user.organization_id)
            .order_by(RiskResult.created_at.desc())
            .first()
        )
    if not r_obj:
        r_obj = db.query(RiskResult).order_by(RiskResult.created_at.desc()).first()

    sle = r_obj.single_loss_expectancy if r_obj else 125000.0
    aro = r_obj.annualized_rate_of_occurrence if r_obj else 3.8
    
    # Convert if currency is USD
    rate = 1.0 if currency.upper() == "INR" else (1.0 / 83.50)
    sle_conv = sle * rate

    mc_data = run_monte_carlo_simulation(
        single_loss_expectancy=sle_conv,
        annualized_rate_of_occurrence=aro,
        iterations=iterations
    )

    bins = mc_data.get("bins", [])
    frequencies = mc_data.get("frequencies", [])
    histogram = []
    for i in range(len(frequencies)):
        start = bins[i] if i < len(bins) else 0
        end = bins[i + 1] if i + 1 < len(bins) else start * 1.15
        histogram.append({
            "bin_start": round(start, 2),
            "bin_end": round(end, 2),
            "frequency": frequencies[i]
        })

    exceedance_curve = []
    for pt in mc_data.get("loss_exceedance_curve", []):
        loss_val = pt.get("loss_threshold", pt.get("loss", 0))
        exceedance_curve.append({
            "loss": loss_val,
            "loss_threshold": loss_val,
            "exceedance_probability": pt.get("exceedance_probability", 0)
        })

    return {
        "histogram": histogram,
        "bins": bins,
        "frequencies": frequencies,
        "exceedance_curve": exceedance_curve,
        "var_90": mc_data.get("p90_loss", sle_conv * aro * 1.35),
        "var_95": mc_data.get("p95_loss", sle_conv * aro * 1.82),
        "var_99": mc_data.get("p99_loss", sle_conv * aro * 2.45),
        "mean_loss": mc_data.get("mean_loss", sle_conv * aro),
        "median_loss": mc_data.get("median_loss", sle_conv * aro * 0.95),
        "iterations": iterations,
        "currency": currency.upper()
    }

@router.get("/business-loss")
@router.get("/loss-breakdown")
def get_business_loss_breakdown(
    currency: str = "INR",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = (
        db.query(RiskResult)
        .filter(RiskResult.organization_id == current_user.organization_id)
        .order_by(RiskResult.created_at.desc())
        .first()
    )
    if not res:
        res = db.query(RiskResult).order_by(RiskResult.created_at.desc()).first()

    rate = 1.0 if currency.upper() == "INR" else (1.0 / 83.50)
    
    if not res:
        base = 22500000.0 * rate
        downtime = round(base * 0.28, 2)
        recovery = round(base * 0.20, 2)
        data_impact = round(base * 0.18, 2)
        ir = round(base * 0.14, 2)
        legal = round(base * 0.10, 2)
        reputation = round(base * 0.10, 2)
    else:
        downtime = round(res.downtime_cost * rate, 2)
        recovery = round(res.recovery_cost * rate, 2)
        data_impact = round(res.data_impact_cost * rate, 2)
        ir = round(res.incident_response_cost * rate, 2)
        legal = round(res.compliance_legal_cost * rate, 2)
        reputation = round(res.operational_loss * rate, 2)

    categories = [
        {"name": "Business Interruption & Downtime", "category": "Business Interruption", "value": downtime, "amount": downtime, "percentage": 28, "color": "#ef4444"},
        {"name": "System Recovery & Rebuild", "category": "Recovery", "value": recovery, "amount": recovery, "percentage": 20, "color": "#f97316"},
        {"name": "Direct Asset & Data Loss", "category": "Direct Asset Loss", "value": data_impact, "amount": data_impact, "percentage": 18, "color": "#eab308"},
        {"name": "Incident Response & Forensics", "category": "Incident Response", "value": ir, "amount": ir, "percentage": 14, "color": "#10b981"},
        {"name": "Legal & Regulatory Fines", "category": "Legal & Fines", "value": legal, "amount": legal, "percentage": 10, "color": "#8b5cf6"},
        {"name": "Reputational & Brand Damage", "category": "Reputational Loss", "value": reputation, "amount": reputation, "percentage": 10, "color": "#06b6d4"}
    ]

    return {
        "breakdown": {
            "direct_loss": data_impact,
            "business_interruption": downtime,
            "legal_and_compliance": legal,
            "incident_response": ir,
            "reputation_damage": reputation,
            "system_recovery": recovery
        },
        "categories": categories,
        "currency": currency.upper()
    }

@router.post("/ml-predict")
def predict_risk(
    features: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    return predict_cyber_risk(features)

