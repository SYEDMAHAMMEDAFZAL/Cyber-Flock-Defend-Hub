from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.organization import Organization, Plan, Subscription, SubscriptionStatus
from app.schemas.organization import (
    OrganizationResponse, OrganizationBase, PlanResponse, SubscriptionResponse
)
from app.security.dependencies import get_current_user, require_role, log_audit_event
from app.security.jwt import create_access_token

router = APIRouter()

@router.get("/", response_model=List[OrganizationResponse])
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enforce strict multi-tenant isolation: Only SUPER_ADMIN can view all registered organizations.
    Standard tenant roles (Analyst, CISO, Auditor) can only view their own organization."""
    if current_user.role == UserRole.SUPER_ADMIN:
        return db.query(Organization).all()
    return db.query(Organization).filter(Organization.id == current_user.organization_id).all()

@router.get("/current", response_model=OrganizationResponse)
def get_current_organization(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org

@router.put("/current", response_model=OrganizationResponse)
def update_current_organization(
    payload: OrganizationBase,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO])),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(org, k, v)
    
    db.commit()
    db.refresh(org)
    log_audit_event(db, current_user, "UPDATE", "ORGANIZATION", org.id, f"Updated organization profile for {org.name}")
    return org

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization_by_id(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org

@router.get("/plans", response_model=List[PlanResponse])
def get_available_plans(db: Session = Depends(get_db)):
    return db.query(Plan).all()

@router.get("/subscription")
def get_current_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = (
        db.query(Subscription)
        .filter(Subscription.organization_id == current_user.organization_id)
        .order_by(Subscription.start_date.desc())
        .first()
    )
    if not sub:
        # Provide default fallback
        plan = db.query(Plan).filter(Plan.slug == "professional").first() or db.query(Plan).first()
        return {
            "id": "sub-fallback",
            "organization_id": current_user.organization_id,
            "plan_id": plan.id if plan else "plan-fallback",
            "status": "ACTIVE",
            "billing_cycle": "ANNUAL",
            "current_simulations_used": 12,
            "plan": plan
        }
    return {
        "id": sub.id,
        "organization_id": sub.organization_id,
        "plan_id": sub.plan_id,
        "status": sub.status.value,
        "billing_cycle": sub.billing_cycle,
        "start_date": sub.start_date,
        "end_date": sub.end_date,
        "current_simulations_used": sub.current_simulations_used,
        "plan": sub.plan
    }

@router.post("/subscription/upgrade")
def upgrade_subscription(
    plan_slug: str,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO])),
    db: Session = Depends(get_db)
):
    target_plan = db.query(Plan).filter(Plan.slug == plan_slug.lower()).first()
    if not target_plan:
        raise HTTPException(status_code=404, detail="Requested tier not found.")

    sub = (
        db.query(Subscription)
        .filter(Subscription.organization_id == current_user.organization_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription record not found.")

    sub.plan_id = target_plan.id
    sub.status = SubscriptionStatus.ACTIVE
    db.commit()
    db.refresh(sub)
    log_audit_event(db, current_user, "UPGRADE", "SUBSCRIPTION", sub.id, f"Upgraded tier to {target_plan.name}")

    return {
        "message": f"Successfully upgraded subscription tier to {target_plan.name}.",
        "plan": target_plan
    }

@router.post("/switch/{org_id}")
def switch_active_organization(
    org_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows Super Admin or authorized users to switch the active organization context."""
    target_org = db.query(Organization).filter(Organization.id == org_id).first()
    if not target_org:
        raise HTTPException(status_code=404, detail="Target organization not found.")

    if current_user.role != UserRole.SUPER_ADMIN and current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Unauthorized to switch to this organization.")

    # Re-issue JWT with new org_id
    token = create_access_token(
        data={
            "sub": current_user.id,
            "email": current_user.email,
            "org_id": target_org.id,
            "role": current_user.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "switched_to_organization": {
            "id": target_org.id,
            "name": target_org.name,
            "industry": target_org.industry
        }
    }

