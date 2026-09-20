from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.organization import Organization, Plan, Subscription, DemoRequest, DemoRequestStatus
from app.models.assets import Asset
from app.models.simulation import Simulation
from app.models.audit import BlockchainAnchor
from app.schemas.organization import (
    OrganizationResponse, PlanResponse, PlanUpdate,
    DemoRequestResponse, DemoRequestUpdate
)
from app.schemas.auth import UserResponse
from app.security.dependencies import require_role, log_audit_event

router = APIRouter()

@router.get("/stats")
@router.get("/metrics")
def get_admin_metrics(
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    total_orgs = db.query(Organization).count()
    total_users = db.query(User).count()
    total_sims = db.query(Simulation).count()
    total_assets = db.query(Asset).count()
    total_anchored = db.query(BlockchainAnchor).count()
    pending_demos = db.query(DemoRequest).filter(DemoRequest.status == DemoRequestStatus.PENDING).count()

    # Calculate projected MRR based on active subscriptions
    subs = db.query(Subscription).all()
    mrr = sum(s.plan.monthly_price for s in subs if s.plan)

    return {
        "total_organizations": total_orgs,
        "total_users": total_users,
        "total_simulations": total_sims,
        "total_managed_assets": total_assets,
        "total_blockchain_anchors": total_anchored,
        "pending_demo_requests": pending_demos,
        "monthly_recurring_revenue_inr": mrr,
        "platform_version": "2.4.0-Enterprise",
        "is_simulated": False
    }

@router.get("/organizations", response_model=List[OrganizationResponse])
def list_all_organizations(
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(Organization).order_by(Organization.created_at.desc()).all()

@router.put("/organizations/{org_id}/status")
def toggle_organization_status(
    org_id: str,
    is_active: bool,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    org.is_active = is_active
    db.commit()
    log_audit_event(db, current_user, "TOGGLE_STATUS", "ORGANIZATION", org.id, f"Set active state to {is_active}")
    return {"message": "Status updated successfully.", "organization": org}

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).limit(limit).all()

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: UserRole,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")
    target.role = role
    db.commit()
    log_audit_event(db, current_user, "UPDATE_ROLE", "USER", target.id, f"Changed role to {role.value}")
    return {"message": "User role updated successfully.", "user": target}

@router.get("/plans", response_model=List[PlanResponse])
def list_plans(
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(Plan).all()

@router.put("/plans/{plan_id}", response_model=PlanResponse)
def update_plan_limits(
    plan_id: str,
    payload: PlanUpdate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    p = db.query(Plan).filter(Plan.id == plan_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Plan not found.")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    log_audit_event(db, current_user, "UPDATE_LIMITS", "PLAN", p.id, f"Updated plan quotas for {p.name}")
    return p

@router.get("/demo-requests", response_model=List[DemoRequestResponse])
def list_demo_requests(
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(DemoRequest).order_by(DemoRequest.created_at.desc()).all()

@router.put("/demo-requests/{req_id}", response_model=DemoRequestResponse)
def update_demo_request_status(
    req_id: str,
    payload: DemoRequestUpdate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    dr = db.query(DemoRequest).filter(DemoRequest.id == req_id).first()
    if not dr:
        raise HTTPException(status_code=404, detail="Demo request not found.")
    dr.status = payload.status
    dr.reviewed_at = datetime.utcnow()
    dr.reviewed_by = current_user.email
    db.commit()
    db.refresh(dr)
    log_audit_event(db, current_user, "UPDATE_STATUS", "DEMO_REQUEST", dr.id, f"Updated status to {payload.status.value}")
    return dr

