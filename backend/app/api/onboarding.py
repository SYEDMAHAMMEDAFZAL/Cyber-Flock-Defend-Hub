import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.organization import Organization
from app.models.assets import Asset, Endpoint, Application, CriticalityLevel, AssetType
from app.schemas.organization import OrganizationBase, OrganizationResponse
from app.security.dependencies import get_current_user, require_role, log_audit_event

router = APIRouter()

@router.post("/complete", response_model=OrganizationResponse)
def complete_onboarding(
    payload: OrganizationBase,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO])),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(org, k, v)
    
    org.is_onboarded = True
    
    # Provision initial primary assets if none exist
    existing_assets_count = db.query(Asset).filter(Asset.organization_id == org.id).count()
    if existing_assets_count == 0:
        base_assets = [
            ("Core Transaction Database", AssetType.DATABASE, CriticalityLevel.CRITICAL, "10.0.1.20", 45000000.0, 0.85, False),
            ("Customer-Facing Web Gateway", AssetType.SERVER, CriticalityLevel.HIGH, "10.0.1.10", 12000000.0, 0.70, True),
            ("Active Directory Master DC", AssetType.DOMAIN_CONTROLLER, CriticalityLevel.CRITICAL, "10.0.1.5", 35000000.0, 0.90, False),
            ("Kubernetes API Node", AssetType.CLOUD_RESOURCE, CriticalityLevel.HIGH, "10.0.2.15", 18000000.0, 0.65, True)
        ]
        for aname, atype, crit, ip, val, exp, is_ext in base_assets:
            ast = Asset(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                name=f"{org.name[:10]}-{aname}",
                asset_type=atype,
                ip_address=ip,
                criticality=crit,
                financial_value=val,
                exposure_factor=exp,
                is_internet_facing=is_ext,
                location="Primary Cloud Region",
                status="ACTIVE",
                is_simulated=True
            )
            db.add(ast)
            db.flush()

            # Attach endpoint
            ep = Endpoint(
                id=str(uuid.uuid4()),
                asset_id=ast.id,
                organization_id=org.id,
                endpoint_name=f"node-{ast.name.lower().replace(' ', '-')}",
                os_type="Linux Ubuntu 22.04" if atype != AssetType.DOMAIN_CONTROLLER else "Windows Server 2022",
                ip_address=ip,
                edr_agent_installed=True,
                edr_status="ONLINE",
                is_simulated=True
            )
            db.add(ep)

    db.commit()
    db.refresh(org)
    log_audit_event(db, current_user, "COMPLETE", "ONBOARDING", org.id, f"Completed enterprise onboarding for {org.name}")
    return org

