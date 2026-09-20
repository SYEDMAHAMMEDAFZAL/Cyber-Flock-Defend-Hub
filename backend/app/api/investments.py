import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.simulation import SecurityControl
from app.models.risk import RiskResult, InvestmentRecommendation
from app.schemas.risk import InvestmentOptimizationRequest, InvestmentOptimizationResponse
from app.security.dependencies import get_current_user, require_role, log_audit_event
from app.services.optimizer import solve_knapsack_investment

router = APIRouter()

@router.post("/optimize", response_model=InvestmentOptimizationResponse)
def optimize_security_investments(
    payload: InvestmentOptimizationRequest,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST])),
    db: Session = Depends(get_db)
):
    # Fetch candidate security controls from database
    controls = db.query(SecurityControl).all()
    candidate_list = [
        {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "category": c.category,
            "cost_inr": c.cost_inr,
            "risk_reduction_percent": c.risk_reduction_percent,
            "effectiveness_score": c.effectiveness_score,
            "coverage_percent": c.coverage_percent
        }
        for c in controls
    ]

    # Fetch latest risk baseline
    latest_risk = (
        db.query(RiskResult)
        .filter(RiskResult.organization_id == current_user.organization_id)
        .order_by(RiskResult.created_at.desc())
        .first()
    )
    current_risk_score = latest_risk.risk_score if latest_risk else 68.5
    current_ale = latest_risk.annualized_loss_expectancy if latest_risk else 18500000.0

    # Solve 0/1 Knapsack optimization
    solution = solve_knapsack_investment(
        allocated_budget=payload.allocated_budget,
        candidate_controls=candidate_list,
        current_risk_score=current_risk_score,
        current_ale=current_ale,
        risk_tolerance=payload.risk_tolerance or "MEDIUM"
    )

    # Persist recommendation
    rec_record = InvestmentRecommendation(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        allocated_budget=payload.allocated_budget,
        recommended_controls_json=json.dumps([c["code"] for c in solution["recommended_controls"]]),
        total_investment_required=solution["total_investment_required"],
        risk_before=solution["risk_before"],
        risk_after=solution["risk_after"],
        risk_reduction_percent=solution["risk_reduction_percent"],
        ale_before=solution["ale_before"],
        ale_after=solution["ale_after"],
        estimated_roi_percent=solution["estimated_roi_percent"],
        solver_used=solution["solver_used"],
        is_simulated=True
    )
    db.add(rec_record)
    db.commit()

    log_audit_event(
        db, current_user, "OPTIMIZE", "INVESTMENT",
        rec_record.id,
        f"Calculated optimal security investment for budget INR {payload.allocated_budget:,.2f}."
    )

    return solution

@router.get("/history")
def get_investment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = (
        db.query(InvestmentRecommendation)
        .filter(InvestmentRecommendation.organization_id == current_user.organization_id)
        .order_by(InvestmentRecommendation.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": r.id,
            "allocated_budget": r.allocated_budget,
            "total_investment_required": r.total_investment_required,
            "recommended_controls": json.loads(r.recommended_controls_json),
            "risk_before": r.risk_before,
            "risk_after": r.risk_after,
            "risk_reduction_percent": r.risk_reduction_percent,
            "ale_before": r.ale_before,
            "ale_after": r.ale_after,
            "estimated_roi_percent": r.estimated_roi_percent,
            "solver_used": r.solver_used,
            "created_at": r.created_at
        }
        for r in recs
    ]

