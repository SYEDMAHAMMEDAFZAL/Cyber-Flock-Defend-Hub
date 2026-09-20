from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User
from app.models.organization import Organization
from app.models.risk import RiskResult
from app.schemas.market import MarketBenchmarkResponse
from app.security.dependencies import get_current_user
from app.services.market_service import get_benchmarks, compare_organization_to_benchmark

router = APIRouter()

@router.get("/benchmarks", response_model=List[MarketBenchmarkResponse])
def list_market_benchmarks(db: Session = Depends(get_db)):
    return get_benchmarks(db)

@router.get("/compare")
def compare_peer_benchmark(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    latest_risk = (
        db.query(RiskResult)
        .filter(RiskResult.organization_id == current_user.organization_id)
        .order_by(RiskResult.created_at.desc())
        .first()
    )
    ale = latest_risk.annualized_loss_expectancy if latest_risk else 22500000.0
    sec_budget = org.cybersecurity_budget if org else 8500000.0
    it_budget = org.it_budget if org else 35000000.0
    ind = org.industry if org else "Technology"

    return compare_organization_to_benchmark(
        org_industry=ind,
        org_ale=ale,
        org_security_budget=sec_budget,
        org_it_budget=it_budget,
        db=db
    )

