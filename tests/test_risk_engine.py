import pytest
from app.services.risk_engine import (
    calculate_sle, calculate_aro, calculate_ale, calculate_risk_score,
    calculate_var, calculate_business_loss_breakdown, convert_currency,
    quantify_comprehensive_risk
)

def test_sle_calculation():
    asset_value = 10000000.0  # 10M INR
    exposure_factor = 0.5
    sle = calculate_sle(asset_value, exposure_factor)
    assert sle == 5000000.0

def test_aro_and_ale_calculation():
    threat_freq = 1.0
    exploitability = 0.8
    control_mitigation = 50.0
    aro = calculate_aro(threat_freq, exploitability, control_mitigation)
    assert aro > 0.0

    sle = 2000000.0
    ale = calculate_ale(sle, aro)
    assert ale > 0.0
    assert ale == round(sle * aro, 2)

def test_var_quantiles():
    ale = 1000000.0
    var_90 = calculate_var(ale, 0.90)
    var_95 = calculate_var(ale, 0.95)
    var_99 = calculate_var(ale, 0.99)
    assert var_90 < var_95 < var_99
    assert var_95 == round(ale * 2.15, 2)

def test_loss_breakdown():
    total = 10000000.0
    breakdown = calculate_business_loss_breakdown(total)
    assert "downtime_cost" in breakdown
    assert "recovery_cost" in breakdown
    assert "incident_response_cost" in breakdown
    assert "data_impact_cost" in breakdown
    assert "operational_loss" in breakdown
    assert "compliance_legal_cost" in breakdown
    summed = (
        breakdown["downtime_cost"] + breakdown["recovery_cost"] +
        breakdown["incident_response_cost"] + breakdown["data_impact_cost"] +
        breakdown["operational_loss"] + breakdown["compliance_legal_cost"]
    )
    assert abs(summed - total) < 0.05

def test_currency_conversion():
    inr_amount = 83500.0
    usd_amount = convert_currency(inr_amount, "INR", "USD")
    assert usd_amount == 1000.0
    back_to_inr = convert_currency(usd_amount, "USD", "INR")
    assert back_to_inr == 83500.0

