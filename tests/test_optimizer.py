import pytest
from app.services.optimizer import solve_knapsack_investment

def test_knapsack_optimizer():
    budget = 3000000.0  # 3M INR
    controls = [
        {"name": "EDR", "code": "EDR", "cost_inr": 1800000.0, "risk_reduction_percent": 30.0, "effectiveness_score": 0.9, "category": "Preventative"},
        {"name": "MFA", "code": "MFA", "cost_inr": 600000.0, "risk_reduction_percent": 25.0, "effectiveness_score": 0.95, "category": "Preventative"},
        {"name": "WAF", "code": "WAF", "cost_inr": 1200000.0, "risk_reduction_percent": 18.0, "effectiveness_score": 0.85, "category": "Preventative"},
        {"name": "SIEM", "code": "SIEM", "cost_inr": 3500000.0, "risk_reduction_percent": 28.0, "effectiveness_score": 0.88, "category": "Detective"}
    ]
    current_risk = 75.0
    current_ale = 25000000.0

    solution = solve_knapsack_investment(
        allocated_budget=budget,
        candidate_controls=controls,
        current_risk_score=current_risk,
        current_ale=current_ale,
        risk_tolerance="MEDIUM"
    )

    assert solution["total_investment_required"] <= budget
    assert len(solution["recommended_controls"]) > 0
    assert solution["risk_after"] < current_risk
    assert solution["ale_after"] < current_ale
    assert solution["risk_reduction_percent"] > 0.0

