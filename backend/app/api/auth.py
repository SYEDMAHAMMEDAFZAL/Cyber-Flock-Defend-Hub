import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth import User, UserRole
from app.models.organization import Organization, Plan, Subscription, SubscriptionStatus
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, GoogleLoginRequest
from app.security.jwt import verify_password, get_password_hash, create_access_token
from app.security.dependencies import get_current_user
from app.security.google_auth import google_auth_provider

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this official email already exists.")

    # Check or create organization
    org = None
    if payload.organization_id:
        org = db.query(Organization).filter(Organization.id == payload.organization_id).first()
    
    if not org:
        org_name = payload.organization_name or f"{payload.full_name}'s Enterprise"
        org = Organization(
            id=str(uuid.uuid4()),
            name=org_name,
            organization_type="Enterprise",
            industry="Technology",
            is_onboarded=False,
            is_active=True,
            is_simulated=True
        )
        db.add(org)
        db.flush()

        # Attach default Professional trial subscription
        pro_plan = db.query(Plan).filter(Plan.slug == "professional").first()
        if not pro_plan:
            pro_plan = db.query(Plan).first()
        
        if pro_plan:
            sub = Subscription(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                plan_id=pro_plan.id,
                status=SubscriptionStatus.ACTIVE,
                billing_cycle="ANNUAL",
                start_date=datetime.utcnow(),
                current_simulations_used=0
            )
            db.add(sub)

    role = payload.role or UserRole.CISO
    new_user = User(
        id=str(uuid.uuid4()),
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=role,
        organization_id=org.id,
        job_title=payload.job_title or "Security Lead",
        is_active=True,
        is_verified=True,
        is_simulated=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        data={
            "sub": new_user.id,
            "email": new_user.email,
            "org_id": new_user.organization_id,
            "role": new_user.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled. Contact security administrator.")

    token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "org_id": user.organization_id,
            "role": user.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled. Contact security administrator.")

    token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "org_id": user.organization_id,
            "role": user.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/google", response_model=Token)
def login_with_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    if payload.email:
        google_data = {
            "email": payload.email.lower(),
            "name": payload.name or payload.email.split("@")[0].title(),
            "sub": f"google-{uuid.uuid4().hex[:12]}",
            "email_verified": True
        }
    else:
        token_str = payload.credential or payload.token or "mock_token"
        google_data = google_auth_provider.verify_token_and_get_user(token_str)
        
    email = google_data["email"].lower()
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Auto-provision on first Google Login
        org = Organization(
            id=str(uuid.uuid4()),
            name=f"{google_data['name']}'s Cloud Security Workspace",
            organization_type="Enterprise",
            industry="Technology",
            is_onboarded=False,
            is_active=True,
            is_simulated=True
        )
        db.add(org)
        db.flush()

        pro_plan = db.query(Plan).filter(Plan.slug == "professional").first() or db.query(Plan).first()
        if pro_plan:
            sub = Subscription(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                plan_id=pro_plan.id,
                status=SubscriptionStatus.ACTIVE,
                billing_cycle="ANNUAL",
                start_date=datetime.utcnow()
            )
            db.add(sub)

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            full_name=google_data["name"],
            hashed_password=get_password_hash(uuid.uuid4().hex),
            role=UserRole.CISO,
            organization_id=org.id,
            job_title="Security Lead / Evaluator",
            is_active=True,
            is_verified=True,
            is_simulated=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "org_id": user.organization_id,
            "role": user.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/request-elevation")
def request_elevation(
    reason: str = "Requesting Enterprise Organization Access",
    target_role: str = "CISO",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.audit import Notification
    notif = Notification(
        id=str(uuid.uuid4()),
        title=f"Access Elevation Request: {current_user.full_name}",
        message=f"User {current_user.email} has requested elevated role '{target_role}'. Reason: {reason}",
        severity="MEDIUM",
        target_role="SUPER_ADMIN",
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    return {"message": "Access elevation request dispatched to Super Administrator.", "status": "PENDING_APPROVAL"}

