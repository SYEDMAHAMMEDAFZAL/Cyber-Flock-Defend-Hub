import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.organization import DemoRequest, DemoRequestStatus
from app.schemas.organization import DemoRequestCreate, DemoRequestResponse

from app.services.email_service import send_demo_confirmation_email

router = APIRouter()

@router.post("/request", response_model=DemoRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_demo_request(payload: DemoRequestCreate, db: Session = Depends(get_db)):
    """Public endpoint for enterprise prospective customers to book a private live defense walkthrough."""
    req_id = str(uuid.uuid4())
    demo = DemoRequest(
        id=req_id,
        name=payload.name,
        official_email=payload.official_email,
        organization=payload.organization,
        job_role=payload.job_role,
        phone=payload.phone,
        organization_size=payload.organization_size,
        industry=payload.industry,
        number_of_endpoints=payload.number_of_endpoints,
        security_tools_currently_used=payload.security_tools_currently_used,
        preferred_demo_date=payload.preferred_demo_date,
        preferred_demo_time=payload.preferred_demo_time,
        requirements_message=payload.requirements_message,
        status=DemoRequestStatus.PENDING,
        created_at=datetime.utcnow()
    )
    db.add(demo)
    db.commit()
    db.refresh(demo)

    # Trigger automated executive invitation email dispatch
    email_res = send_demo_confirmation_email(
        recipient_email=payload.official_email,
        full_name=payload.name,
        company_name=payload.organization,
        job_role=payload.job_role,
        preferred_date=payload.preferred_demo_date,
        preferred_time=payload.preferred_demo_time,
        notes=payload.requirements_message
    )

    # Attach dispatch metadata to response
    res_dict = {
        "id": demo.id,
        "name": demo.name,
        "official_email": demo.official_email,
        "organization": demo.organization,
        "job_role": demo.job_role,
        "phone": demo.phone,
        "organization_size": demo.organization_size,
        "industry": demo.industry,
        "number_of_endpoints": demo.number_of_endpoints,
        "security_tools_currently_used": demo.security_tools_currently_used,
        "preferred_demo_date": demo.preferred_demo_date,
        "preferred_demo_time": demo.preferred_demo_time,
        "requirements_message": demo.requirements_message,
        "status": demo.status,
        "created_at": demo.created_at,
        "reviewed_at": demo.reviewed_at,
        "reviewed_by": demo.reviewed_by,
        "email_dispatch_status": email_res.get("status"),
        "vip_passcode": email_res.get("vip_passcode"),
        "meet_url": email_res.get("meet_url"),
        "email_preview_html": email_res.get("preview_html")
    }
    return DemoRequestResponse(**res_dict)

