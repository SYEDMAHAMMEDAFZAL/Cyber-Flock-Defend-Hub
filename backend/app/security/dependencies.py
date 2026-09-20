from typing import List, Optional, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.auth import User, UserRole
from app.models.organization import Subscription, Plan, SubscriptionStatus
from app.models.audit import AuditLog
from app.security.jwt import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("user_id") or payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception

    active_org_id = request.headers.get("X-Organization-ID")
    if active_org_id:
        if user.role == UserRole.SUPER_ADMIN or user.organization_id == active_org_id:
            user.organization_id = active_org_id

    return user

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # SUPER_ADMIN bypasses role checks
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {[r.value for r in allowed_roles]} roles."
            )
        return current_user
    return role_checker

def get_current_user_org(
    current_user: User = Depends(get_current_user)
) -> Optional[str]:
    # Returns organization_id or None for super_admin
    return current_user.organization_id

def require_feature(feature_flag_name: str):
    """
    Enforces backend subscription feature gating:
    Never trusts frontend - verifies organization plan capabilities.
    """
    def feature_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user
        
        if not current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no assigned organization."
            )
        
        subscription = db.query(Subscription).filter(
            Subscription.organization_id == current_user.organization_id
        ).first()

        if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Active subscription required to access this feature."
            )
        
        plan = db.query(Plan).filter(Plan.id == subscription.plan_id).first()
        if not plan or not getattr(plan, feature_flag_name, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_flag_name}' is not enabled in your current plan ({plan.name if plan else 'None'}). Please upgrade to Enterprise."
            )
        return current_user
    return feature_checker

def log_audit_event(
    db: Session,
    arg2: Any = None,
    arg3: Any = None,
    arg4: Optional[str] = None,
    arg5: Optional[Any] = None,
    arg6: Optional[str] = None,
    arg7: Optional[str] = None
):
    try:
        import uuid
        # Check if arg2 is a User object: log_audit_event(db, user, action, res_type, res_id, details, ip)
        if hasattr(arg2, "organization_id") or hasattr(arg2, "email"):
            user = arg2
            action = str(arg3 or "UNKNOWN")
            resource_type = str(arg4 or "RESOURCE")
            resource_id = str(arg5) if arg5 is not None else None
            details = str(arg6) if arg6 is not None else None
            ip_address = str(arg7) if arg7 is not None else None
        else:
            # Traditional: log_audit_event(db, action, res_type, res_id, user, details, ip)
            action = str(arg2 or "UNKNOWN")
            resource_type = str(arg3 or "RESOURCE")
            resource_id = str(arg4) if arg4 is not None else None
            user = arg5 if hasattr(arg5, "organization_id") else None
            details = str(arg6) if arg6 is not None else None
            ip_address = str(arg7) if arg7 is not None else None

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            organization_id=getattr(user, "organization_id", None),
            user_id=getattr(user, "id", None),
            user_email=getattr(user, "email", "SYSTEM"),
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            details=details
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit log failed: {e}")
