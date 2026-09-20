"""
Cyber Flock Defense Hub - Security Investment Optimization Engine
Formulates and solves 0/1 Knapsack / Mixed Integer Linear Programming (MILP)
problems to maximize enterprise risk reduction under strict budget constraints.
"""

from typing import List, Dict, Any, Optional
import pulp

def solve_knapsack_investment(
    allocated_budget: float,
    candidate_controls: List[Dict[str, Any]],
    current_risk_score: float,
    current_ale: float,
    risk_tolerance: str = "MEDIUM"
) -> Dict[str, Any]:
    """
    Solves optimal security investment portfolio.
    
    Decision variable x_i in {0, 1} for each security control.
    Maximize: sum(x_i * utility_i)
    Subject to: sum(x_i * cost_i) <= allocated_budget
    """
    if not candidate_controls or allocated_budget <= 0:
        return {
            "allocated_budget": allocated_budget,
            "recommended_controls": [],
            "total_investment_required": 0.0,
            "risk_before": current_risk_score,
            "risk_after": current_risk_score,
            "risk_reduction_percent": 0.0,
            "ale_before": current_ale,
            "ale_after": current_ale,
            "estimated_roi_percent": 0.0,
            "solver_used": "No candidate controls or zero budget",
            "is_simulated": True
        }

    # Weight utility based on risk tolerance
    # LOW tolerance favors high-effectiveness preventative controls
    tolerance_multipliers = {
        "LOW": {"Preventative": 1.25, "Detective": 1.1, "Corrective": 0.9},
        "MEDIUM": {"Preventative": 1.0, "Detective": 1.0, "Corrective": 1.0},
        "HIGH": {"Preventative": 0.9, "Detective": 1.15, "Corrective": 1.25}
    }
    multipliers = tolerance_multipliers.get(risk_tolerance.upper(), tolerance_multipliers["MEDIUM"])

    # Setup PuLP Problem
    prob = pulp.LpProblem("CyberSecurity_Investment_Optimization", pulp.LpMaximize)
    
    # Decision variables
    control_vars = {}
    for c in candidate_controls:
        var_name = f"ctrl_{c['code']}"
        control_vars[c['code']] = pulp.LpVariable(var_name, cat=pulp.LpBinary)

    # Objective function: Maximize cumulative risk utility
    objective_terms = []
    for c in candidate_controls:
        cat = c.get("category", "Preventative")
        mult = multipliers.get(cat, 1.0)
        eff = c.get("effectiveness_score", 0.85)
        reduction = c.get("risk_reduction_percent", 15.0)
        utility = reduction * eff * mult
        objective_terms.append(control_vars[c['code']] * utility)
        
    prob += pulp.lpSum(objective_terms), "Total_Risk_Reduction_Utility"

    # Constraint: Total cost <= allocated_budget
    cost_terms = [control_vars[c['code']] * c.get("cost_inr", 0.0) for c in candidate_controls]
    prob += pulp.lpSum(cost_terms) <= allocated_budget, "Budget_Constraint"

    # Solve
    solver_used = "PuLP CBC Mixed-Integer Linear Programming"
    try:
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        status = pulp.LpStatus[prob.status]
    except Exception:
        status = "SolverException"

    # Fallback to Greedy Heuristic if solver status is not Optimal
    if status != "Optimal":
        solver_used = "Greedy Utility/Cost Heuristic (Fallback)"
        sorted_controls = sorted(
            candidate_controls,
            key=lambda x: (x.get("risk_reduction_percent", 1.0) * x.get("effectiveness_score", 1.0)) / max(1.0, x.get("cost_inr", 1.0)),
            reverse=True
        )
        selected = []
        spent = 0.0
        for ctrl in sorted_controls:
            cost = ctrl.get("cost_inr", 0.0)
            if spent + cost <= allocated_budget:
                selected.append(ctrl)
                spent += cost
    else:
        selected = []
        spent = 0.0
        for c in candidate_controls:
            if control_vars[c['code']].varValue and control_vars[c['code']].varValue > 0.5:
                selected.append(c)
                spent += c.get("cost_inr", 0.0)

    # Compute risk and ALE reductions
    # Compounding risk reduction formula: (1 - prod(1 - r_i/100))
    residual_factor = 1.0
    for sc in selected:
        red = sc.get("risk_reduction_percent", 10.0) / 100.0
        eff = sc.get("effectiveness_score", 0.85)
        residual_factor *= (1.0 - (red * eff))
        
    total_reduction_pct = round((1.0 - residual_factor) * 100.0, 1)
    
    risk_after = round(max(5.0, current_risk_score * (1.0 - (total_reduction_pct / 100.0) * 0.7)), 1)
    ale_after = round(max(0.0, current_ale * (1.0 - (total_reduction_pct / 100.0))), 2)
    ale_saved = current_ale - ale_after
    
    # Net ROI: (Loss Prevented - Investment) / Investment * 100%
    if spent > 0:
        net_roi = round(((ale_saved - spent) / spent) * 100.0, 1)
    else:
        net_roi = 0.0

    # Ensure consistent control attributes for UI presentation
    formatted_recommended = []
    selected_codes = set(c.get("code") for c in selected)
    for sc in selected:
        item = dict(sc)
        item["cost"] = item.get("cost_inr", 1500000.0)
        item["ale_reduction_rate"] = item.get("risk_reduction_percent", 15.0) / 100.0
        item["implementation_days"] = item.get("implementation_days", 14)
        formatted_recommended.append(item)

    formatted_deferred = []
    for cc in candidate_controls:
        if cc.get("code") not in selected_codes:
            item = dict(cc)
            item["cost"] = item.get("cost_inr", 2500000.0)
            item["ale_reduction_rate"] = item.get("risk_reduction_percent", 15.0) / 100.0
            item["implementation_days"] = item.get("implementation_days", 21)
            formatted_deferred.append(item)

    return {
        "allocated_budget": allocated_budget,
        "recommended_controls": formatted_recommended,
        "deferred_controls": formatted_deferred,
        "selected_controls": formatted_recommended,
        "rejected_controls": formatted_deferred,
        "total_investment_required": round(spent, 2),
        "total_cost": round(spent, 2),
        "risk_before": current_risk_score,
        "risk_after": risk_after,
        "risk_reduction_percent": total_reduction_pct,
        "ale_before": current_ale,
        "ale_after": ale_after,
        "net_ale_reduction": round(ale_saved, 2),
        "estimated_roi_percent": net_roi,
        "roi_percentage": net_roi,
        "solver_used": solver_used,
        "is_simulated": True
    }

