import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.telemetry import SIEMEvent, EDRAlert, PAMEvent, DetectionStatus
from app.models.assets import CriticalityLevel
from app.schemas.telemetry import (
    SIEMEventResponse, EDRAlertResponse, PAMEventResponse,
    SIEMEventCreate, EDRAlertCreate, PAMEventCreate
)
from app.security.dependencies import get_current_user, require_role, log_audit_event

router = APIRouter()

@router.get("/siem", response_model=List[SIEMEventResponse])
def get_siem_events(
    severity: Optional[str] = None,
    detection_status: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(SIEMEvent).filter(SIEMEvent.organization_id == current_user.organization_id)
    if severity:
        q = q.filter(SIEMEvent.severity == severity.upper())
    if detection_status:
        q = q.filter(SIEMEvent.detection_status == detection_status.upper())
    return q.order_by(SIEMEvent.timestamp.desc()).limit(limit).all()

@router.get("/edr", response_model=List[EDRAlertResponse])
def get_edr_alerts(
    severity: Optional[str] = None,
    is_blocked: Optional[bool] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(EDRAlert).filter(EDRAlert.organization_id == current_user.organization_id)
    if severity:
        q = q.filter(EDRAlert.severity == severity.upper())
    if is_blocked is not None:
        q = q.filter(EDRAlert.is_blocked == is_blocked)
    return q.order_by(EDRAlert.timestamp.desc()).limit(limit).all()

@router.get("/pam", response_model=List[PAMEventResponse])
def get_pam_events(
    mfa_verified: Optional[bool] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(PAMEvent).filter(PAMEvent.organization_id == current_user.organization_id)
    if mfa_verified is not None:
        q = q.filter(PAMEvent.mfa_verified == mfa_verified)
    return q.order_by(PAMEvent.timestamp.desc()).limit(limit).all()

@router.get("/metrics")
def get_telemetry_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org_id = current_user.organization_id
    total_siem = db.query(SIEMEvent).filter(SIEMEvent.organization_id == org_id).count()
    critical_siem = db.query(SIEMEvent).filter(SIEMEvent.organization_id == org_id, SIEMEvent.severity == CriticalityLevel.CRITICAL).count()
    
    total_edr = db.query(EDRAlert).filter(EDRAlert.organization_id == org_id).count()
    blocked_edr = db.query(EDRAlert).filter(EDRAlert.organization_id == org_id, EDRAlert.is_blocked == True).count()
    
    total_pam = db.query(PAMEvent).filter(PAMEvent.organization_id == org_id).count()
    unverified_pam = db.query(PAMEvent).filter(PAMEvent.organization_id == org_id, PAMEvent.mfa_verified == False).count()

    # MITRE ATT&CK tactic distribution
    mitre_summary = [
        {"tactic": "Initial Access", "technique": "T1190", "count": 84, "severity": "CRITICAL"},
        {"tactic": "Execution", "technique": "T1059", "count": 62, "severity": "HIGH"},
        {"tactic": "Credential Access", "technique": "T1110", "count": 112, "severity": "HIGH"},
        {"tactic": "Defense Evasion", "technique": "T1078", "count": 58, "severity": "CRITICAL"},
        {"tactic": "Lateral Movement", "technique": "T1021", "count": 44, "severity": "HIGH"},
        {"tactic": "Impact", "technique": "T1486", "count": 31, "severity": "CRITICAL"},
        {"tactic": "Exfiltration", "technique": "T1048", "count": 27, "severity": "CRITICAL"}
    ]

    return {
        "total_siem_events": total_siem,
        "critical_siem_events": critical_siem,
        "total_edr_alerts": total_edr,
        "contained_edr_alerts": blocked_edr,
        "total_pam_sessions": total_pam,
        "unverified_pam_violations": unverified_pam,
        "mitre_distribution": mitre_summary,
        "is_simulated": True
    }

@router.post("/ingest/siem", response_model=SIEMEventResponse, status_code=201)
def ingest_siem_event(
    payload: SIEMEventCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.IT_ADMIN])),
    db: Session = Depends(get_db)
):
    evt = SIEMEvent(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        asset_id=payload.asset_id,
        event_type=payload.event_type,
        severity=payload.severity,
        source_ip=payload.source_ip,
        destination_ip=payload.destination_ip,
        destination_port=payload.destination_port,
        user_identity=payload.user_identity,
        endpoint_name=payload.endpoint_name,
        mitre_technique_id=payload.mitre_technique_id,
        mitre_technique_name=payload.mitre_technique_name,
        detection_status=payload.detection_status or DetectionStatus.DETECTED,
        risk_score=payload.risk_score,
        estimated_loss=payload.estimated_loss,
        recommended_action=payload.recommended_action,
        timestamp=datetime.utcnow(),
        is_simulated=True
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return evt

@router.post("/ingest/edr", response_model=EDRAlertResponse, status_code=201)
def ingest_edr_alert(
    payload: EDRAlertCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.IT_ADMIN])),
    db: Session = Depends(get_db)
):
    alert = EDRAlert(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        endpoint_name=payload.endpoint_name,
        process_name=payload.process_name,
        process_path=payload.process_path,
        command_line=payload.command_line,
        parent_process=payload.parent_process,
        sha256_hash=payload.sha256_hash,
        threat_name=payload.threat_name,
        severity=payload.severity,
        mitre_technique_id=payload.mitre_technique_id,
        is_blocked=payload.is_blocked,
        detection_status=payload.detection_status or DetectionStatus.CONTAINED,
        timestamp=datetime.utcnow(),
        is_simulated=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/ingest/pam", response_model=PAMEventResponse, status_code=201)
def ingest_pam_event(
    payload: PAMEventCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.IT_ADMIN])),
    db: Session = Depends(get_db)
):
    pam = PAMEvent(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        privileged_user=payload.privileged_user,
        target_resource=payload.target_resource,
        session_id=payload.session_id or f"PAM-{uuid.uuid4().hex[:8].upper()}",
        action_performed=payload.action_performed,
        severity=payload.severity,
        mitre_technique_id=payload.mitre_technique_id,
        mfa_verified=payload.mfa_verified,
        timestamp=datetime.utcnow(),
        is_simulated=True
    )
    db.add(pam)
    db.commit()
    db.refresh(pam)
    return pam

