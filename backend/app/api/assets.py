import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.assets import Asset, Endpoint, Application, CriticalityLevel, AssetType
from app.schemas.assets import (
    AssetCreate, AssetResponse, EndpointResponse, ApplicationResponse
)
from app.security.dependencies import get_current_user, require_role, log_audit_event

router = APIRouter()

@router.get("/", response_model=List[AssetResponse])
def get_assets(
    criticality: Optional[str] = None,
    asset_type: Optional[str] = None,
    is_internet_facing: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Asset).filter(Asset.organization_id == current_user.organization_id)
    if criticality:
        query = query.filter(Asset.criticality == criticality.upper())
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type.upper())
    if is_internet_facing is not None:
        query = query.filter(Asset.is_internet_facing == is_internet_facing)
    return query.order_by(Asset.financial_value.desc()).all()

@router.post("/", response_model=AssetResponse, status_code=201)
def create_asset(
    payload: AssetCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.IT_ADMIN])),
    db: Session = Depends(get_db)
):
    new_asset = Asset(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        name=payload.name,
        asset_type=payload.asset_type,
        ip_address=payload.ip_address,
        hostname=payload.hostname,
        criticality=payload.criticality,
        financial_value=payload.financial_value,
        exposure_factor=payload.exposure_factor,
        is_internet_facing=payload.is_internet_facing,
        location=payload.location or "Primary Datacenter",
        status="ACTIVE",
        is_simulated=True
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    log_audit_event(db, current_user, "CREATE", "ASSET", new_asset.id, f"Created asset {new_asset.name}")
    return new_asset

@router.get("/metrics")
def get_asset_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assets = db.query(Asset).filter(Asset.organization_id == current_user.organization_id).all()
    total_val = sum(a.financial_value for a in assets)
    critical_count = sum(1 for a in assets if a.criticality == CriticalityLevel.CRITICAL)

    internet_facing_count = sum(1 for a in assets if a.is_internet_facing)
    
    endpoints_count = db.query(Endpoint).filter(Endpoint.organization_id == current_user.organization_id).count()
    apps_count = db.query(Application).filter(Application.organization_id == current_user.organization_id).count()

    return {
        "total_assets": len(assets),
        "total_financial_value_inr": round(total_val, 2),
        "critical_assets_count": critical_count,
        "internet_facing_count": internet_facing_count,
        "endpoints_count": endpoints_count,
        "applications_count": apps_count,
        "is_simulated": True
    }

@router.get("/endpoints", response_model=List[EndpointResponse])
def get_endpoints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Endpoint).filter(Endpoint.organization_id == current_user.organization_id).all()

@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Application).filter(Application.organization_id == current_user.organization_id).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset_by_id(asset_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.organization_id == current_user.organization_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: str,
    payload: AssetCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.IT_ADMIN])),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.organization_id == current_user.organization_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    for k, v in payload.dict().items():
        setattr(asset, k, v)
    
    db.commit()
    db.refresh(asset)
    log_audit_event(db, current_user, "UPDATE", "ASSET", asset.id, f"Updated asset {asset.name}")
    return asset

@router.delete("/{asset_id}")
def delete_asset(
    asset_id: str,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO])),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.organization_id == current_user.organization_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    db.delete(asset)
    db.commit()
    log_audit_event(db, current_user, "DELETE", "ASSET", asset_id, f"Deleted asset {asset.name}")
    return {"message": "Asset deleted successfully."}

