from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from app.models.auth import UserRole

ROLE_MAPPING = {
    "super_admin": UserRole.SUPER_ADMIN,
    "admin": UserRole.ORG_ADMIN,
    "org_admin": UserRole.ORG_ADMIN,
    "ciso": UserRole.CISO,
    "executive": UserRole.CISO,
    "security_analyst": UserRole.SECURITY_ANALYST,
    "analyst": UserRole.SECURITY_ANALYST,
    "red_team": UserRole.RED_TEAM,
    "auditor": UserRole.AUDITOR,
    "it_admin": UserRole.IT_ADMIN,
    "viewer": UserRole.VIEWER,
}

def normalize_role(v) -> UserRole:
    if isinstance(v, UserRole):
        return v
    if isinstance(v, str):
        cleaned = v.strip().lower()
        if cleaned in ROLE_MAPPING:
            return ROLE_MAPPING[cleaned]
        upper_cleaned = v.strip().upper()
        for member in UserRole:
            if member.value == upper_cleaned or member.name == upper_cleaned:
                return member
    return UserRole.SECURITY_ANALYST

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.VIEWER
    job_title: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, v):
        return normalize_role(v)

class UserCreate(UserBase):
    password: str
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    job_title: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def handle_field_aliases(cls, data):
        if isinstance(data, dict):
            if "name" in data and not data.get("full_name"):
                data["full_name"] = data["name"]
            if not data.get("full_name") and data.get("email"):
                data["full_name"] = data.get("email", "").split("@")[0].title()
            if "role" in data:
                data["role"] = normalize_role(data["role"])
        return data

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None

class UserResponse(UserBase):
    id: str
    organization_id: Optional[str] = None
    is_active: bool
    is_verified: bool
    auth_provider: str = "LOCAL"
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: Optional[UserResponse] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    organization_id: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

