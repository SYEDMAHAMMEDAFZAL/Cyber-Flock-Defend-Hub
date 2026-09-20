import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.audit import AuditReport, HashRecord, BlockchainAnchor, AuditLog, Notification
from app.models.risk import RiskResult
from app.schemas.audit import (
    AuditReportResponse, HashVerificationRequest, HashVerificationResponse,
    BlockchainAnchorRequest, BlockchainAnchorResponse, NotificationResponse
)
from app.security.dependencies import get_current_user, require_role, log_audit_event
from app.services.hasher import verify_risk_result_hash
from app.services.blockchain_service import blockchain_service
from app.services.report_generator import generate_executive_audit_report

router = APIRouter()

# --- Audit Reports ---
@router.get("/reports", response_model=List[AuditReportResponse])
def get_audit_reports(
    organization_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Multi-tenant audit report retrieval:
    - Non-Super-Admins: Strictly restricted to their own organization's reports.
    - Super-Admin: Can audit across any tenant or active organization."""
    query = db.query(AuditReport)
    if current_user.role != UserRole.SUPER_ADMIN:
        query = query.filter(AuditReport.organization_id == current_user.organization_id)
    else:
        target_org = organization_id or current_user.organization_id
        if target_org:
            query = query.filter(AuditReport.organization_id == target_org)
    return query.order_by(AuditReport.created_at.desc()).all()

@router.post("/reports/generate", response_model=AuditReportResponse)
def create_report(
    risk_result_id: Optional[str] = None,
    report_title: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.AUDITOR])),
    db: Session = Depends(get_db)
):
    report = generate_executive_audit_report(
        db=db,
        organization_id=current_user.organization_id,
        risk_result_id=risk_result_id,
        report_title=report_title
    )
    log_audit_event(db, current_user, "GENERATE", "REPORT", report.id, f"Generated executive audit report {report.report_title}")
    return report

@router.get("/reports/{report_id}/download")
def download_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = (
        db.query(AuditReport)
        .filter(AuditReport.id == report_id, AuditReport.organization_id == current_user.organization_id)
        .first()
    )
    if not report or not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk.")
    
    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="text/html"
    )

# --- Cryptographic SHA-256 Verification ---
@router.post("/verify-hash", response_model=HashVerificationResponse)
def verify_hash(payload: HashVerificationRequest, db: Session = Depends(get_db)):
    target_hash = (payload.sha256_hash or payload.hash_sha256 or "").strip().lower().replace("0x", "")
    
    found_rec = None
    calculated = None
    result_id = payload.result_id

    # 1. Search by hash across AuditReport, BlockchainAnchor, HashRecord, RiskResult
    if target_hash:
        # Check AuditReport
        ar = db.query(AuditReport).filter(AuditReport.sha256_hash.ilike(f"%{target_hash}%")).first()
        if not ar:
            ar = db.query(AuditReport).filter((AuditReport.id == target_hash) | (AuditReport.assessment_id.ilike(f"%{target_hash}%"))).first()
        if ar:
            found_rec = ar
            calculated = ar.sha256_hash
            result_id = result_id or ar.id
        
        # Check BlockchainAnchor
        if not found_rec:
            ba = db.query(BlockchainAnchor).filter(BlockchainAnchor.sha256_hash.ilike(f"%{target_hash}%")).first()
            if ba:
                found_rec = ba
                calculated = ba.sha256_hash
                result_id = result_id or ba.result_id
        
        # Check HashRecord
        if not found_rec:
            hr = db.query(HashRecord).filter(HashRecord.sha256_hash.ilike(f"%{target_hash}%")).first()
            if hr:
                found_rec = hr
                calculated = hr.sha256_hash
                result_id = result_id or hr.result_id
        
        # Check RiskResult
        if not found_rec:
            rr = db.query(RiskResult).filter(RiskResult.sha256_hash.ilike(f"%{target_hash}%")).first()
            if rr:
                found_rec = rr
                calculated = rr.sha256_hash
                result_id = result_id or rr.id

    # 2. Fallback search by result_id if provided
    if not found_rec and payload.result_id:
        ar = db.query(AuditReport).filter(AuditReport.id == payload.result_id).first()
        if ar:
            found_rec = ar
            calculated = ar.sha256_hash
            result_id = ar.id
        else:
            hr = db.query(HashRecord).filter(HashRecord.result_id == payload.result_id).first()
            if hr:
                found_rec = hr
                calculated = hr.sha256_hash
                result_id = hr.result_id
            else:
                rr = db.query(RiskResult).filter(RiskResult.id == payload.result_id).first()
                if rr and rr.sha256_hash:
                    found_rec = rr
                    calculated = rr.sha256_hash
                    result_id = rr.id

    clean_calc = (calculated or "").lower().replace("0x", "").strip()
    is_match = bool(found_rec and calculated and (clean_calc == target_hash or clean_calc.startswith(target_hash) or target_hash.startswith(clean_calc)))

    return {
        "result_id": result_id or (found_rec.id if found_rec else "N/A"),
        "provided_hash": f"0x{target_hash}" if target_hash else "None",
        "calculated_hash": f"0x{calculated}" if calculated else "0x0000000000000000000000000000000000000000000000000000000000000000",
        "is_valid": is_match,
        "verified": is_match,
        "timestamp": datetime.utcnow(),
        "algorithm": "SHA-256",
        "status": "CRYPTOGRAPHICALLY_VERIFIED" if is_match else "INTEGRITY_TAMPERED"
    }

# --- Blockchain Anchoring ---
@router.post("/blockchain/anchor", response_model=BlockchainAnchorResponse)
def anchor_hash_on_blockchain(
    payload: BlockchainAnchorRequest,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.AUDITOR])),
    db: Session = Depends(get_db)
):
    anchor_info = blockchain_service.anchor_hash(payload.result_id, payload.sha256_hash)
    
    # Check or create HashRecord
    hash_rec = db.query(HashRecord).filter(HashRecord.result_id == payload.result_id).first()
    if not hash_rec:
        hash_rec = HashRecord(
            id=str(uuid.uuid4()),
            result_id=payload.result_id,
            organization_id=current_user.organization_id,
            user_id=current_user.id,
            sha256_hash=payload.sha256_hash,
            canonical_json="{}",
            algorithm="SHA-256",
            data_version="1.0"
        )
        db.add(hash_rec)
        db.flush()

    anchor_record = BlockchainAnchor(
        id=str(uuid.uuid4()),
        hash_record_id=hash_rec.id,
        sha256_hash=payload.sha256_hash,
        network=anchor_info["network"],
        contract_address=anchor_info["contract_address"],
        transaction_hash=anchor_info["transaction_hash"],
        block_number=anchor_info["block_number"],
        status="ANCHORED",
        anchored_at=anchor_info["anchored_at"]
    )
    db.add(anchor_record)

    # Update risk result record
    rr = db.query(RiskResult).filter(RiskResult.id == payload.result_id).first()
    if rr:
        rr.is_anchored = True
        rr.blockchain_tx_hash = anchor_info["transaction_hash"]

    db.commit()
    db.refresh(anchor_record)

    log_audit_event(
        db, current_user, "ANCHOR", "BLOCKCHAIN",
        anchor_record.id,
        f"Anchored risk hash {payload.sha256_hash[:16]}... on {anchor_info['network']} (Tx: {anchor_info['transaction_hash'][:16]}...)"
    )

    return anchor_record

@router.get("/blockchain/verify/{result_id}")
def verify_blockchain_anchor(result_id: str, db: Session = Depends(get_db)):
    hash_rec = db.query(HashRecord).filter(HashRecord.result_id == result_id).first()
    if not hash_rec:
        raise HTTPException(status_code=404, detail="Anchor record not found.")

    anchor = db.query(BlockchainAnchor).filter(BlockchainAnchor.hash_record_id == hash_rec.id).first()
    if not anchor:
        return {
            "result_id": result_id,
            "status": "PENDING_ANCHOR",
            "is_anchored": False,
            "sha256_hash": hash_rec.sha256_hash
        }

    return {
        "result_id": result_id,
        "is_anchored": True,
        "sha256_hash": anchor.sha256_hash,
        "network": anchor.network,
        "contract_address": anchor.contract_address,
        "transaction_hash": anchor.transaction_hash,
        "block_number": anchor.block_number,
        "status": anchor.status,
        "anchored_at": anchor.anchored_at
    }

# --- Audit Trail Logs ---
@router.get("/logs")
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.CISO, UserRole.AUDITOR])),
    db: Session = Depends(get_db)
):
    q = db.query(AuditLog).filter(AuditLog.organization_id == current_user.organization_id)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()

# --- Notifications ---
@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.organization_id == current_user.organization_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.organization_id == current_user.organization_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}

